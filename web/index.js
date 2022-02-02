require('dotenv').config()

const express = require('express');
const app = express();
const PouchDB = require('pouchdb');
const dbMessages = new PouchDB('db_messages');

app.use('/', express.static(__dirname + '/static'))

app.get('/messages', async (req, res) => {
  const response = (await dbMessages.allDocs({
    include_docs: true,
    startkey: req.query.channel,
    endkey: `${req.query.channel}\ufff0`
  })).rows.map(r => r.doc);
  res.json(response);
});

app.listen(process.env.PORT, process.env.HOST);