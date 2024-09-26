import type { Knex } from 'knex';

/**
 * 


    permissions table 

    user_id
    permission : 'read-write' | 'read-only' | 'admin'
    trip_id : number reference to trip table


    categories :
    add a category column to the trip table

    Also, 
    add a category column to the image table

 */

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('permissions', (table) => {
      table.increments('id').primary();
      table
        .integer('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table
        .enum('permission', ['read-write', 'read-only', 'admin'])
        .notNullable();
      table
        .integer('trip_id')
        .references('id')
        .inTable('trips')
        .onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .table('trips', (table) => {
      table.json('categories').notNullable().defaultTo('[]');
    })
    .table('images', (table) => {
      table.string('category');
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable('permissions')
    .table('trips', (table) => {
      table.dropColumn('categories');
    })
    .table('images', (table) => {
      table.dropColumn('category');
    });
}
