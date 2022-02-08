module.exports = (messages, channel) => {
  return messages
    .map(m => {
      if (m.id === '939786540668825650') console.log(m.embeds[0].thumbnail);
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
          .filter(e => e.image || e.thumbnail)
          .map(e => ({
            _id: `${channel.id}_${(e.image || e.thumbnail)?.url?.replace(/jpg:large$/, 'jpg')}`,
            message: m.id,
            channel: channel.id,
            url: (e.image?.proxyURL || e.thumbnail?.proxyURL)?.replace(/jpg:large$/, 'jpg'),
            height: (e.image || e.thumbnail)?.height,
            width: (e.image || e.thumbnail)?.width,
            ratio: (e.image || e.thumbnail)?.height / (e.image || e.thumbnail)?.width,
            author: m.author.username,
            createdAt: m.createdAt,
            reference: e.url
          }))
      ];
    })
    .flat();
};
