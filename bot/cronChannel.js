const processMessages = require('./processMessages');
const pg = require('../database/pg');

const pageSize = 50;
const fetchMessages = (channel, lastFetch, lastMessage) => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      try {
        const messages = await channel.messages.fetch({ 
          limit: pageSize,
          before: lastMessage?.id
        });
        
        const formattedMessages = processMessages(messages, channel);
        if (formattedMessages.length) {
          await pg('messages')
            .insert(formattedMessages)
            .onConflict('id')
            .merge();
        }
        
        if (messages.every(m => m.createdAt > lastFetch) && messages.size === pageSize) await fetchMessages(channel, lastFetch, messages.last());
      }
      catch(e) {}
      resolve();
    }, 1000);
  });
};

module.exports = (client) => {
  setInterval(async () => {
    const channels = await pg('channels');
    for (const channel of channels) {
      await fetchMessages(await client.channels.fetch(channel.id), new Date(channel.last_fetch));
      try {
        await pg('channels')
          .insert({
            ...channel,
            last_fetch: new Date()
          })
          .onConflict('id')
          .merge();
      }
      catch(e) {}
    }
  }, 60 * 1000 * 10);
};
