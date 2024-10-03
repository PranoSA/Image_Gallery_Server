import type { Knex } from 'knex';

/**
 * 
Change the Previous Tables to turn their ID serials into UUIDS
as well as references to trip.id from serial to UUIDS
 */

/**
 * 
    Table Invite - 
    id: UUID
    email: string
    token: string
    created_at: timestamp
    expires_at: timestamp

 * @param knex 


 */

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .table('trips', (table) => {
      table.dropColumn('id');
    })
    .table('trips', (table) => {
      table.uuid('id').primary();
    })
    .table('images', (table) => {
      table.dropColumn('id');
    })
    .table('images', (table) => {
      table.uuid('id').primary();
    })
    .table('paths', (table) => {
      table.dropColumn('id');
    })
    .table('paths', (table) => {
      table.uuid('id').primary();
    })
    .table('permissions', (table) => {
      table.dropColumn('id');
    })
    .table('permissions', (table) => {
      table.uuid('id').primary();
    })
    .table('day_summaries', (table) => {
      table.dropColumn('id');
    })
    .table('day_summaries', (table) => {
      table.uuid('id').primary();
    })
    .table('images', (table) => {
      table
        .uuid('tripid')
        .references('id')
        .inTable('trips')
        .onDelete('CASCADE')
        .alter();
    })
    .table('paths', (table) => {
      table
        .uuid('tripid')
        .references('id')
        .inTable('trips')
        .onDelete('CASCADE')
        .alter();
    })
    .table('permissions', (table) => {
      table
        .uuid('tripid')
        .references('id')
        .inTable('trips')
        .onDelete('CASCADE')
        .alter();
    })
    .table('day_summaries', (table) => {
      table
        .uuid('tripid')
        .references('id')
        .inTable('trips')
        .onDelete('CASCADE')
        .alter();
    })
    .createTable('invites', (table) => {
      table.uuid('id').primary();
      table.string('email').notNullable();
      table.string('token').notNullable();
      table
        .uuid('tripid')
        .references('id')
        .inTable('trips')
        .onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('expires_at').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable('invites')
    .table('paths', (table) => {
      table.dropColumn('id');
    })
    .table('paths', (table) => {
      table.increments('id').primary();
    })
    .table('images', (table) => {
      table.dropColumn('id');
    })
    .table('images', (table) => {
      table.increments('id').primary();
    })
    .table('trips', (table) => {
      table.dropColumn('id');
    })
    .table('trips', (table) => {
      table.increments('id').primary();
    })
    .table('permissions', (table) => {
      table.dropColumn('id');
    })
    .table('permissions', (table) => {
      table.increments('id').primary();
    })
    .table('day_summaries', (table) => {
      table.dropColumn('id');
    })
    .table('day_summaries', (table) => {
      table.increments('id').primary();
    })
    .table('images', (table) => {
      table.dropColumn('tripid');
    })
    .table('images', (table) => {
      table
        .integer('tripid')
        .references('id')
        .inTable('trips')
        .onDelete('CASCADE')
        .alter();
    })
    .table('paths', (table) => {
      table.dropColumn('tripid');
    })
    .table('paths', (table) => {
      table
        .integer('tripid')
        .references('id')
        .inTable('trips')
        .onDelete('CASCADE')
        .alter();
    })
    .table('permissions', (table) => {
      table.dropColumn('tripid');
    })
    .table('permissions', (table) => {
      table
        .integer('tripid')
        .references('id')
        .inTable('trips')
        .onDelete('CASCADE')
        .alter();
    })
    .table('day_summaries', (table) => {
      table.dropColumn('tripid');
    })
    .table('day_summaries', (table) => {
      table
        .integer('tripid')
        .references('id')
        .inTable('trips')
        .onDelete('CASCADE')
        .alter();
    });
}
