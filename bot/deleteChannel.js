const PouchDB = require('pouchdb');
const dbChannels = new PouchDB('db_channels');
const dbMessages = new PouchDB('db_messages');

module.exports = async (channel) => {
  try {
    const chanRecord = await dbChannels.get(channel.id);
    await dbChannels.remove(chanRecord);
  }
  catch(e) {};
  try {
    const docs = (await dbMessages.allDocs({
      startkey: channel.id,
      endkey: `${channel.id}\ufff0`
    })).rows;
    await Promise.all(docs.map(d => {
      return dbMessages.remove(d.id, d.value.rev);
    }));
  }
  catch(e) {}
  dbChannels.compact();
  dbMessages.compact();
};