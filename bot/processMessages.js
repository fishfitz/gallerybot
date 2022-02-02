module.exports = (messages, channel) => {
  return messages
    .map(m => {
      return [
        ...m.attachments
          .filter(a => (a.contentType && a.contentType.indexOf('image/') !== -1) || a.proxyURL.search(/\.(jpg|jpeg|png|gif|webp)$/) !== -1)
          .map(a => ({
            _id: `${channel.id}_${a.proxyURL}`,
            message: m.id,
            channel: channel.id,
            url: a.proxyURL,
            height: a.height,
            width: a.width,
            ratio: a.height / a.width,
            author: m.author.username,
            createdAt: m.createdAt
          })),
        ...m.embeds
          .filter(e => e.image)
          .map(e => ({
            _id: `${channel.id}_${e.image.url.replace(/jpg:large$/, 'jpg')}`,
            message: m.id,
            channel: channel.id,
            url: e.image.proxyURL?.replace(/jpg:large$/, 'jpg'),
            height: e.image.height,
            width: e.image.width,
            ratio: e.image.height / e.image.width,
            author: m.author.username,
            createdAt: m.createdAt,
            reference: e.url
          }))
      ];
    })
    .flat();
};
