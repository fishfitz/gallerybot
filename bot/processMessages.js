module.exports = (messages, channel) => {
  return messages
    .map(m => {
      return [
        ...m.attachments
          .filter(a => a.contentType.indexOf('image/') !== -1)
          .map(a => ({
            _id: `${channel.id}_${a.proxyURL}`,
            message: m.id,
            channel: channel.id,
            url: a.proxyURL,
            author: m.author.username,
            createdAt: m.createdAt
          })),
        ...m.embeds
          .filter(e => e.image)
          .map(e => ({
            _id: `${channel.id}_${e.image.url.replace(/jpg:large$/, 'jpg')}`,
            message: m.id,
            channel: channel.id,
            url: e.image.url.replace(/jpg:large$/, 'jpg'),
            author: m.author.username,
            createdAt: m.createdAt
          }))
      ];
    })
    .flat();
};