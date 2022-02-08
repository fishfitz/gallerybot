const processMessages = require('./processMessages');
const PouchDB = require('pouchdb');
const dbChannels = new PouchDB('db_channels');
const dbMessages = new PouchDB('db_messages');

const pageSize = 50;
const fetchMessages = (channel, lastFetch, lastMessage) => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      try {
        const messages = await channel.messages.fetch({ 
          limit: pageSize,
          before: lastMessage?.id
        });
        await dbMessages.bulkDocs(processMessages(messages, channel));
        if (messages.every(m => m.createdAt > lastFetch) && messages.size === pageSize) await fetchMessages(channel, lastFetch, messages.last());
      }
      catch(e) {}
      resolve();
    }, 1000);
  });
};

module.exports = (client) => {
  setInterval(async () => {
    const channels = (await dbChannels.allDocs({ include_docs: true })).rows.map(d => d.doc);
    console.log('registered channels:', channels);
    for (const channel of channels) {
      await fetchMessages(await client.channels.fetch(channel._id), new Date(channel.lastFetch));
      try {
        await dbChannels.put({
          ...channel,
          lastFetch: new Date()
        });
      }
      catch(e) {}
    }
    dbChannels.compact();
    dbMessages.compact();
  }, 60 * 1000 * 10);
};
