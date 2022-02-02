const processMessages = require('./processMessages');
const PouchDB = require('pouchdb');
const dbChannels = new PouchDB('db_channels');
const dbMessages = new PouchDB('db_messages');

const pageSize = 100;
const fetchMessagesBackward = (channel, lastMessage) => {
  setTimeout(async () => {
    console.info('Fetching for', channel.id);
    const messages = await channel.messages.fetch({
      limit: pageSize,
      before: lastMessage?.id
    });
    try {
      await dbMessages.bulkDocs(processMessages(messages, channel));
    }
    catch(e) {
      console.error('error when inserting messages', e);
    }
    if (messages.size === pageSize) fetchMessagesBackward(channel, messages.last());
  }, 1000);
};

module.exports = async (channel) => {
  let channelData = {};
  try {
    channelData = await dbChannels.get(channel.id);
  }
  catch(e) {
    console.error('error when creating channel', e);
  }

  try {
    await dbChannels.put({
      ...channelData,
      _id: channel.id,
      name: channel.name,
      lastFetch: new Date()
    });
  }
  catch(e) {
    console.error('error when upserting channel', e);
  }
  
  fetchMessagesBackward(channel);
};
