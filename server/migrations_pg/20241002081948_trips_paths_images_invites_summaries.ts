import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('trips', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.string('description').notNullable();
      table.string('start_date').notNullable();
      table.string('end_date').notNullable();
      table.json('categories').notNullable();
      table.timestamps(true, true);
    })
    .createTable('images', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.string('description').notNullable();
      table.string('file_path').notNullable();
      table.uuid('tripid').references('trips.id').onDelete('CASCADE');
      table.string('long').notNullable();
      table.string('lat').notNullable();
      table.string('category');
      table.timestamps(true, true);
    })
    .createTable('paths', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.string('description').notNullable();
      table.string('kml_file').notNullable();
      table.uuid('tripid').references('trips.id').onDelete('CASCADE');
      table.string('start_date').notNullable();
      table.string('end_date').notNullable();
      table.string('style').defaultTo('solid');
      table.integer('thickness').defaultTo(2);
      table.integer('color_r').defaultTo(255);
      table.integer('color_g').defaultTo(255);
      table.integer('color_b').defaultTo(255);
      table.timestamps(true, true);
    })
    .createTable('day_summaries', (table) => {
      table.date('day').notNullable();
      table.uuid('tripid').notNullable();
      table.string('summary').notNullable();
      table.primary(['day', 'tripid']);
      table.timestamps(true, true);
      //foreign key
      table.foreign('tripid').references('trips.id').onDelete('CASCADE');
    })
    .createTable('permissions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable();
      table
        .enum('permission', ['read-write', 'read-only', 'admin'])
        .notNullable();
      table
        .uuid('tripid')
        .references('id')
        .inTable('trips')
        .onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('invites', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('tripid').references('trips.id').onDelete('CASCADE');
      table.string('email').notNullable();
      table.string('status').defaultTo('pending');
      table.enum('role', ['read-write', 'read-only', 'admin']).notNullable();
      table.string('code').notNullable();
      table
        .timestamp('expires_at')
        .notNullable()
        .defaultTo(knex.raw("now() + interval '1 day'"));
      table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('invites')
    .dropTableIfExists('permissions')
    .dropTableIfExists('day_summaries')
    .dropTableIfExists('paths')
    .dropTableIfExists('images')
    .dropTableIfExists('trips');
}
