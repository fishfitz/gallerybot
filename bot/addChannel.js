const processMessages = require('./processMessages');
const PouchDB = require('pouchdb');
const dbChannels = new PouchDB('db_channels');
const dbMessages = new PouchDB('db_messages');

const pageSize = 100;
const fetchMessagesBackward = (channel, lastMessage) => {
  setTimeout(async () => {
    const messages = await channel.messages.fetch({
      limit: pageSize,
      before: lastMessage?.id
    });
    try {
      await dbMessages.bulkDocs(processMessages(messages, channel));
    }
    catch(e) {
      // silence
    }
    if (messages.size === pageSize) fetchMessagesBackward(channel, messages.last());
  }, 1000);
};

module.exports = async (channel) => {
  let channelData = {};
  try {
    channelData = await dbChannels.get(channel.id);
  }
  catch(e) {}

  await dbChannels.put({
    ...channelData,
    _id: channel.id,
    name: channel.name,
    lastFetch: new Date()
  });
  
  fetchMessagesBackward(channel);
};