const knex = require('knex')({
  client: 'pg-native',
  connection: {
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE
  }
});

const { attachPaginate } = require('knex-paginate');
attachPaginate();

(async () => {
  if (!(await knex.schema.hasTable('channels'))) {
    await knex.schema.createTable('channels', (table) => {
      table.string('id').unique();
      table.string('name');
      table.datetime('created_at');
      table.datetime('last_fetch');
    });
  }

  if (!(await knex.schema.hasTable('messages'))) {
    await knex.schema.createTable('messages', (table) => {
      table.text('id').unique();
      table.string('message');
      table.string('channel').references('channels.id').onDelete('CASCADE');
      table.text('url');
      table.integer('height');
      table.integer('width');
      table.float('ratio');
      table.string('author');
      table.datetime('created_at');
      table.text('reference');
    });
  }
})();

module.exports = knex;