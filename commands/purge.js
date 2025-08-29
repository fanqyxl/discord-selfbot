// pretty much undiscord, stole the delay amounts and tweaked them from it
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const deletedelayms = 650;
const batchdelayms = 2000;
const maxfetchlimit = 100;

module.exports = {
    name: 'purge',
    async execute(message, args, client) {
        const amount = parseInt(args[0]);
        
        
        await message.edit('Purging...');
        
        let deletedcount = 0;
        let failedcount = 0;
        let lastmessageid = message.id;
        let remaining = amount;
        
        while (remaining > 0) {
            const fetchlimit = Math.min(remaining, maxfetchlimit);
            
            try {
                const messages = await message.channel.messages.fetch({
                    limit: fetchlimit,
                    before: lastmessageid
                });
                
                if (messages.size === 0) break;
                
                const ownmessages = messages.filter(msg => msg.author.id === client.user.id && msg.id !== message.id);
                
                if (ownmessages.size === 0) {
                    lastmessageid = messages.last().id;
                    continue;
                }
                
                for (const [id, msg] of ownmessages) {
                    try {
                        await msg.delete();
                        deletedcount++;
                        await delay(deletedelayms);
                    } catch (error) {
                        console.log(`Failed to delete message: ${error.message}`);
                        failedcount++;
                    }
                    
                    remaining--;
                    if (remaining <= 0) break;
                }
                
                lastmessageid = messages.last().id;
                
                if (remaining > 0) {
                    await delay(batchdelayms); // allows for sending messages and DOESNT rate limit you as easily
                    console.log('Waiting before next search.');
                }
                
            } catch (error) {
                console.error('Error getting messages:', error);
                break;
            }
        }
        
        await message.edit(`Purged: ${deletedcount} Failed: ${failedcount}`);
    }
};