import type { Knex } from 'knex';

/**
 * 

    untimed trips is a boolean that is true if the trip is untimed

    These trips will not have timed categories, and instead will have categories available on every date

    when you scroll through the dates - it will automatically go to the next date
    with vailable pictures

* @param knex 

 */

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('trips', (table) => {
    table.boolean('untimed_trips').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('trips', (table) => {
    table.dropColumn('untimed_trips');
  });
}
