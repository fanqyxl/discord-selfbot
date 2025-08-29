const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

if (!process.env.TOKEN) {
    console.error('Token not found in .env file');
    process.exit(1);
}

if (!process.env.PREFIX) {
    console.error('Prefix not found in .env file');
    process.exit(1);
}

const client = new Client();
const checkintervalms = 30000;
const idleconfigfile = 'idle-config.json';

client.commands = new Map();

function load() {
    const commandspath = path.join(__dirname, 'commands');
    
    if (!fs.existsSync(commandspath)) {
        console.error('Commands directory not found');
        return;
    }
    
    const command_files = fs.readdirSync(commandspath).filter(file => file.endsWith('.js'));

    if (command_files.length === 0) {
        console.warn('No command files found in commands directory');
        return;
    }

    for (const file of command_files) {
        try {
            const file_path = path.join(commandspath, file);
            delete require.cache[require.resolve(file_path)];
            const command = require(file_path);

            if (command.name && typeof command.execute === 'function') {
                client.commands.set(command.name, command);
            } else {
                console.warn(`command file ${file} missing required properties`);
            }
        } catch (err) {
        console.error(`Failed to load command ${file}:`, err.message);
        }
    }
    
    console.log(`Loaded ${client.commands.size} commands`);
}

class IdleMonitor {
    constructor(client) {
        this.client = client;
        this.config_file = path.join(process.cwd(), idleconfigfile);

        this.load_settings();

        this.last_activity = Date.now();
        this.is_idle = false;
        this.original_message = null;
        this.interval_id = null;
    }

    load_settings() {
        try {
            if (fs.existsSync(this.config_file)) {
                const data = JSON.parse(fs.readFileSync(this.config_file, 'utf8'));
                this.enabled = data.enabled || false;
                this.minutes = data.minutes || 10;
                this.custom_status_message = data.customstatusmessage || null;
            } else {
                this.enabled = false;
                this.minutes = 10;
                this.custom_status_message = null;
                this.save_settings();
            }
        } catch (err) {
            console.error('Failed to load idle settings:', err);
            this.enabled = false;
            this.minutes = 10;
            this.custom_status_message = null;
        }
    }

    save_settings() {
        try {
            const data = {
                enabled: this.enabled,
                minutes: this.minutes,
                customstatusmessage: this.custom_status_message
            };
            fs.writeFileSync(this.config_file, JSON.stringify(data, null, 2), 'utf8');
        } catch (err) {
            console.error('Failed to save idle settings:', err);
        }
    }

    start() {
        if (this.interval_id) clearInterval(this.interval_id);
        this.interval_id = setInterval(() => this.check(), checkintervalms);
    }

    async check() {
        if (!this.enabled || !this.client.user) return;

        const now = Date.now();
        const idle_threshold = this.minutes * 60 * 1000;

        if (now - this.last_activity >= idle_threshold && !this.is_idle) {
            try {
                const current = this.client.user.presence?.activities?.find(
                    (a) => a.type === 'CUSTOM'
                );
                this.original_message = current?.state || null;

                await this.client.settings.setCustomStatus({
                    text: this.custom_status_message,
                });

                this.is_idle = true;
            } catch (err) {
                console.error('Failed to set custom status:', err);
            }
        }
    }

    async update() {
        this.last_activity = Date.now();

        if (this.is_idle) {
            try {
                if (this.original_message) {
                    await this.client.settings.setCustomStatus({
                        text: this.original_message,
                    });
                } else {
                    await this.client.settings.setCustomStatus(null);
                }

                this.is_idle = false;
            } catch (err) {
                console.error('Failed to restore custom status:', err);
            }
        }
    }

    stop() {
        if (this.interval_id) clearInterval(this.interval_id);
    }
}

const idlemonitor = new IdleMonitor(client);
client.idlemonitor = idlemonitor;

client.on('messageCreate', async (message) => {
    if (!client.user || message.author?.id !== client.user.id) return;

    idlemonitor.update();

    if (!message.content || !message.content.startsWith(process.env.PREFIX)) return;

    const withoutprefix = message.content.slice(process.env.PREFIX.length).trim();
    if (!withoutprefix) return;

    const parts = withoutprefix.split(/\s+/);
    const commandname = (parts.shift() || '').toLowerCase();
    const args = parts;

    const command = client.commands.get(commandname);
    if (!command) return;

    try {
        await command.execute(message, args, client);
    } catch (err) {
        console.error(`Error running command "${commandname}"`, err);
    }
});

client.on('ready', async () => {
    console.log(`Logged in as: ${client.user.username}`);
    console.log(`ID: ${client.user.id}`);
    
    load();
    idlemonitor.start();
    
    setInterval(() => {
        console.log(`Bot uptime: ${Math.floor(process.uptime())}s`);
    }, 300000);
});

client.on('messageUpdate', (oldmessage, newmessage) => {
    if (!client.user || newmessage.author?.id !== client.user.id) return;
    idlemonitor.update();
});

client.on('messageReactionAdd', (reaction, user) => {
    if (!client.user || user.id !== client.user.id) return;
    idlemonitor.update();
});

client.on('messageReactionRemove', (reaction, user) => {
    if (!client.user || user.id !== client.user.id) return;
    idlemonitor.update();
});

client.on('typingStart', (typing) => {
    if (!client.user || typing.user?.id !== client.user.id) return;
    idlemonitor.update();
});

client.on('interactionCreate', (interaction) => {
    if (!client.user || interaction.user?.id !== client.user.id) return;
    idlemonitor.update();
});

client.login(process.env.TOKEN).catch((err) => {
    console.error('Login failed:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    idlemonitor.stop();
    client.destroy().then(() => {
        process.exit(1);
    }).catch(() => {
        process.exit(1);
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => {
        console.log('Cleaning up...');
        idlemonitor.stop();
        client.destroy();
        process.exit(0);
    });
});
