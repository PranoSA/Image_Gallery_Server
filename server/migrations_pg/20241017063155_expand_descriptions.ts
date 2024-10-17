import type { Knex } from 'knex';

/**
Make trip descriptions longer
[1024] vs [255]
*/

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('trips', (table) => {
    table.string('description', 1024).notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('trips', (table) => {
    table.string('description', 255).notNullable().alter();
  });
}
