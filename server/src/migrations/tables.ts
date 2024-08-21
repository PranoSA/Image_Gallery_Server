import db from '../db/knex';

// Create Tables

const createTables = async () => {
  try {
    await db.schema.createTable('trips', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.string('description');
      table.integer('user_id').references('users.id').onDelete('CASCADE');
      table.date('start_date');
      table.date('end_date');
      table.timestamps(true, true);
    });

    await db.schema.createTable('images', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.string('description');
      table.string('file_path');
      table.integer('tripid').references('trips.id').onDelete('CASCADE');
      table.dateTime('created_at');
      table.string('long');
      table.string('lat');
      table.timestamps(true, true);
    });

    await db.schema.createTable('paths', (table) => {
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
  } catch (error) {
    console.log(error);
  }
};

createTables();
