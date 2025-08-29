module.exports = {
    name: 'ping',
    async execute(message, args, client) {
        console.log('Running ping command.');
        const reply = await message.reply('Pinging...');
        const api = reply.createdTimestamp - message.createdTimestamp; // retarded buttt it works
        const ws = client.ws.ping;
        
        await reply.edit(`API Latency: ${api}ms\n\nWS Latency: ${ws}ms`);
    }
};