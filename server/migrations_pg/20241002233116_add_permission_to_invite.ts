import type { Knex } from 'knex';

//add permissions to invites table
export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('invites', (table) => {
    table.string('permissions').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('invites', (table) => {
    table.dropColumn('permissions');
  });
}
