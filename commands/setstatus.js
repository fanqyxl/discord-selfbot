module.exports = {
    name: 'setstatus',
    async execute(message, args, client) {
        if (args.length === 0) {
            return message.edit(`Usage: \`${process.env.PREFIX}setstatus <status> or clear\``);
        }

        try {
            if (args[0].toLowerCase() === 'clear') {
                await client.settings.setCustomStatus({
                    text: null,
                });
                await message.edit('Status cleared.');
            } else {
                const statusmessage = args.join(' ');
                await client.settings.setCustomStatus({
                    text: statusmessage,
                });
                await message.edit(`Status set to: "${statusmessage}"`);
            }
        } catch (err) {
            console.error('Failed to set status:', err);
            await message.edit('Failed to set status.');
        }
    }
};
