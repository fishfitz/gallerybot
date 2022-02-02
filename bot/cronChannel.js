const processMessages = require('./processMessages');
const PouchDB = require('pouchdb');
const dbChannels = new PouchDB('db_channels');
const dbMessages = new PouchDB('db_messages');

const pageSize = 50;
const fetchMessages = (channel, lastFetch, lastMessage) => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      const messages = await channel.messages.fetch({ 
        limit: pageSize,
        before: lastMessage?.id
      });
      try {
        await dbMessages.bulkDocs(processMessages(messages, channel));
      }
      catch(e) {}
      if (messages.every(m => m.createdAt > lastFetch) && messages.size === pageSize) await fetchMessages(channel, lastFetch, messages.last());
      resolve();
    }, 10 * 60 * 1000);
  });
};

module.exports = (client) => {
  setInterval(async () => {
    const channels = (await dbChannels.allDocs({ include_docs: true })).rows.map(d => d.doc);
    for (const channel of channels) {
      await fetchMessages(await client.channels.fetch(channel._id), new Date(channel.lastFetch));
      await dbChannels.put({
        ...channel,
        lastFetch: new Date()
      });
    }
  }, 1000 * 10);
};