import type { Knex } from 'knex';

/**
 *  
   walking_paths table is created with the following columns:
    id: integer
    name: string
    description: string
    created_at: timestamp
    path: json [sqllite, then converted to json]
     
 */
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('walking_paths', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('description').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.json('path').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('walking_paths');
}
