import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  //Create a Table of Day Summaries, PK [day, tripid]
  await knex.schema.createTable('day_summaries', (table) => {
    table.date('day').notNullable();
    table.integer('tripid').notNullable();
    table.string('summary').notNullable();
    table.primary(['day', 'tripid']);
    table.timestamps(true, true);
    //foreign key
    table.foreign('tripid').references('trips.id').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('day_summaries');
}
