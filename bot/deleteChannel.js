const pg = require('../database/pg');

module.exports = async (channel) => {
  try {
    await pg('channels')
      .where('id', channel.id)
      .delete();
  }
  catch(e) {}
};