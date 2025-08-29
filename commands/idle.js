// partly stolen frmo dariens self bot

// mostly vibecoded command btw
const maxstatuslength = 128;
const maxminutes = 60;
const minminutes = 1;

module.exports = {
    name: 'idle',

    async execute(message, args, client) {
        const idle_monitor = client.idlemonitor;
        if (!idle_monitor) {
            return message.edit('Idle monitor is not setup.');
        }

        if (args.length === 0) {
            const status = idle_monitor.enabled ? 'Enabled' : 'Disabled';
            const minutes = idle_monitor.minutes || 10;
            const current_message = idle_monitor.custom_status_message || 'Not set';

            return message.edit(
                `**Status:** ${status}\n**Minutes:** ${minutes}\n**Message:** ${current_message}`
            );
        }

        const action = args[0].toLowerCase();

        if (action === 'enable') {
            if (args.length < 3) {
                return message.edit(
                    `Usage: \`${process.env.PREFIX}idle enable <minutes> <message>\`\nExample: \`${process.env.PREFIX}idle enable 5 afk\``
                );
            }

            const minutes = parseInt(args[1]);
            if (isNaN(minutes) || minutes < minminutes || minutes > maxminutes) {
                return message.edit('Minutes must be a number between 1 and 60.');
            }

            const status_message = args.slice(2).join(' ');
            if (status_message.length > maxstatuslength) {
                return message.edit(
                    'Custom status message must be 128 chars or less.'
                );
            }

            idle_monitor.enabled = true;
            idle_monitor.minutes = minutes;
            idle_monitor.custom_status_message = status_message;
            idle_monitor.last_activity = Date.now();
            
            const current = client.user.presence?.activities?.find(
                (a) => a.type === 'CUSTOM'
            );
            idle_monitor.original_message = current?.state || null;
            
            idle_monitor.save_settings();

            await message.edit(
                `Idle monitor enabled.`
            );
        } else if (action === 'disable') {
            try {
                if (idle_monitor.is_idle && idle_monitor.original_message) {
                    await client.settings.setCustomStatus({
                        text: idle_monitor.original_message,
                    });
                } else if (idle_monitor.is_idle) {
                    await client.settings.setCustomStatus(null);
                }

                idle_monitor.enabled = false;
                idle_monitor.is_idle = false;
                idle_monitor.original_message = null;
                idle_monitor.custom_status_message = null;
                idle_monitor.save_settings();

                await message.edit(
                    'Idle monitor disabled.'
                );
            } catch (err) {
                console.error(err);
                await message.edit('Failed to disable idle monitor.');
            }
        } else {
            await message.edit(
                `Use: \`${process.env.PREFIX}idle enable <minutes> <message>\` or \`${process.env.PREFIX}idle disable\``
            );
        }
    }
};
