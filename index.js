const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client();

client.commands = new Map();

function load() {
    const commandfiles = fs.readdirSync('./commands');
    
    for (const file of commandfiles) {
        const filepath = `./commands/${file}`;
        const command = require(filepath);
        
        if (command.name) {
            client.commands.set(command.name, command);
        }
    }
}

client.on('messageCreate', async (message) => {

    if (message.author.id !== client.user.id) return;
    
    const prefix = process.env.PREFIX;
    if (!message.content.startsWith(prefix)) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandname = args.shift().toLowerCase();
    
    const command = client.commands.get(commandname);
    if (!command) return;
    
    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(`Error running command ${commandname}:`, error);
        await message.reply('Error running this command!');
    }
});

client.on('ready', async () => {
    console.log(`Logged in as: ${client.user.username}`);
    console.log(`ID: ${client.user.id}`);
    
    load();
});

client.login(process.env.TOKEN);
