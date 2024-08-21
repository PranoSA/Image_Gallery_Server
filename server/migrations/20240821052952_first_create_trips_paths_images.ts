import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('trips', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('description');
    table.integer('user_id').references('users.id').onDelete('CASCADE');
    table.date('start_date');
    table.date('end_date');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('images', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('description');
    table.string('file_path');
    table.integer('tripid').references('trips.id').onDelete('CASCADE');
    table.dateTime('created_at');
    table.string('long');
    table.string('lat');
  });

  await knex.schema.createTable('paths', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('description');
    table.string('kml_file');
    table.integer('tripid').references('trips.id').onDelete('CASCADE');
    table.date('start_date');
    table.date('end_date');
    table.timestamps(true, true);
  });

  console.log('Tables Created');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('paths');
  await knex.schema.dropTableIfExists('images');
  await knex.schema.dropTableIfExists('trips');
}
