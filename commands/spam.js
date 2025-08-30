const spamdelayms = 400;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
	name: 'spam',
	async execute(message, args, client) {
		if (args.length < 2) {
			return message.edit(`Usage: \`${process.env.PREFIX}spam <message> <amount>\``);
		}

		const amountArg = args[args.length - 1];
		const amount = parseInt(amountArg);
		const text = args.slice(0, -1).join(' ');

		if (!text) {
			return message.edit(`Usage: \`${process.env.PREFIX}spam <message> <amount>\``);
		}

		if (isNaN(amount) || amount < 1) {
			return message.edit('Amount must be a positive number.');
		}

		const max = 100;
		if (amount > max) {
			return message.edit(`Amount must be ${max} or less.`);
		}

		try {
			await message.edit('Spamming...');

			for (let i = 0; i < amount; i++) {
				await message.channel.send(text);
				await delay(spamdelayms);
			}

			await message.reply(`Spammed ${amount} messages.`);
		} catch (err) {
			console.error('Failed to spam messages:', err);
			await message.edit('Failed to spam messages.');
		}
	}
};