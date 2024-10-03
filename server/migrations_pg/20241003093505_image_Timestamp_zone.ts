import type { Knex } from 'knex';

/**
 * 
    For Now On - All Images Are Stored in UTC Time
    
    Alongside UTC Time, there will be a string field called "timezone" that will store the timezone of the image

    For Example:

        Image Takne at 11:00 AM in Poland (+2 UTC) will be stored as 11:00 AM UTC with a timezone of +02:00

    The client will then realize the picture was taken at 11L00 AM in Poland
    And if it wishes to convert to TRUE utc time, it will subtract 2 hours from the time


     * @param knex 

 */

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('images', (table) => {
    table.string('time_zone').notNullable().defaultTo('+00:00');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('images', (table) => {
    table.dropColumn('time_zone');
  });
}
