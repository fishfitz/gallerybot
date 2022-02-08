const pg = require('../database/pg');
const express = require('express');
const app = express();

app.use('/', express.static(__dirname + '/static'));

app.get('/channel', async (req, res) => {
  try {
    const channel = await pg('channels')
      .select('channels.id')
      .count({ messages_count: '*' })
      .max({ name: 'channels.name' })
      .leftJoin('messages', 'channels.id', 'messages.channel')
      .where('channels.id', req.query.channel)
      .groupBy('channels.id')
      .first();

    res.json(channel);
  }
  catch(error) {
    console.log(error);
    res.json({ error });
  }
});

app.get('/messages', async (req, res) => {
  const messages = await pg('messages')
    .select('created_at', 'url', 'height', 'width', 'ratio', 'author', 'reference')
    .where('channel', req.query.channel)
    .orderBy('created_at', 'desc')
    .paginate({
      perPage: Math.min(50, req.query.size || 50),
      currentPage: req.query.page
    });

  res.json(messages.data);
});

app.listen(process.env.PORT, process.env.HOST);
