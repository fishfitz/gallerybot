const processMessages = require('./processMessages');
const pg = require('../database/pg');

const pageSize = 100;
const fetchMessagesBackward = (channel, lastMessage) => {
  setTimeout(async () => {
    const messages = await channel.messages.fetch({
      limit: pageSize,
      before: lastMessage?.id
    });
    
    await pg('messages')
      .insert(processMessages(messages, channel))
      .onConflict('id')
      .merge();
    
      if (messages.size === pageSize) fetchMessagesBackward(channel, messages.last());
  }, 1000);
};

module.exports = async (channel) => {
  await pg('channels')
    .insert({
      id: channel.id,
      name: channel.name,
      last_fetch: new Date()
    })
    .onConflict('id')
    .merge();  
  fetchMessagesBackward(channel);
};
