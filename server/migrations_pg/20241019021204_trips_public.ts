import type { Knex } from 'knex';
/**
 * 
 * @param knex 

Add a "Public" field to the trips table
When you visit someones profile - you can see these trips if true

for example -> home is your profile
but /profile/1 is someone elses profile

 */

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('trips', (table) => {
    table.boolean('public').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('trips', (table) => {
    table.dropColumn('public');
  });
}
