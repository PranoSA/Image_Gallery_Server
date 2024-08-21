import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  //Add style [dotted, dashed, solid]
  // Add Thickness
  // Add Color Coordinates [RGB] [0-255, 0-255, 0-255]

  await knex.schema.table('paths', (table) => {
    table.string('style').defaultTo('solid');
    table.integer('thickness').defaultTo(2);
    table.integer('color_r').defaultTo(255);
    table.integer('color_g').defaultTo(255);
    table.integer('color_b').defaultTo(255);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('paths', (table) => {
    table.dropColumn('style');
    table.dropColumn('thickness');
    table.dropColumn('color_r');
    table.dropColumn('color_g');
    table.dropColumn('color_b');
  });
}
