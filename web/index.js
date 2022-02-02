const express = require('express');
const app = express();
const PouchDB = require('pouchdb');
const dbMessages = new PouchDB('db_messages');
const dbChannels = new PouchDB('db_channels');
PouchDB.plugin(require('pouchdb-find'));

dbMessages.createIndex({
  index: { fields: [{ createdAt: 'desc' }, { channel: 'desc' }] }
});

app.use('/', express.static(__dirname + '/static'));

app.get('/channel', async (req, res) => {
  try {
    const channel = (await dbChannels.get(req.query.channel));
    const messagesCount = (await dbMessages.allDocs({
      startkey: req.query.channel,
      endkey: `${req.query.channel}\ufff0`
    })).total_rows;
    res.json({
      ...channel,
      messagesCount
    });
  }
  catch(error) {
    res.json({ error });
  }
});

app.get('/messages', async (req, res) => {
  const response = (await dbMessages.find({
    selector: {
      channel: { $eq: req.query.channel },
      createdAt: { $lt: new Date(req.query.before || new Date()) }
    },
    sort: [{ createdAt: 'desc' }],
    limit: 50
  })).docs;

  res.json(response);
});

app.listen(process.env.PORT, process.env.HOST);