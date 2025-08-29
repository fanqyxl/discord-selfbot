module.exports = {
    name: 'info',
    async execute(message, args, client) {
        const uptime = process.uptime();
        const uptimeformatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;
        
        const info = `**Info**
        
User: ${client.user.username}#${client.user.discriminator}
ID: ${client.user.id}
Uptime: ${uptimeformatted}
WS Ping: ${client.ws.ping}ms
`;

        await message.edit(info);
    }
};
    
