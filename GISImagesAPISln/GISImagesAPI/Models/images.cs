/**
 * 
 *  This class is used to store the image metadata
 * 
 * /  await knex.schema.createTable('images', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('description');
    table.string('file_path');
    table.integer('tripid').references('trips.id').onDelete('CASCADE');
    table.dateTime('created_at');
    table.string('long');
    table.string('lat');
  });

      .table('images', (table) => {
      table.string('category');
    });

    //id is Guid
 * 
 */

namespace GISImagesAPI.Models
{
    public class Image
    {   
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }    

        public string Name { get; set; }

        //Default, empty string
        public string Category { get; set; }
        public string Description { get; set; }

        public string FilePath { get; set; }

        public Guid TripId { get; set; }

        public DateTime CreatedAt { get; set; }

        public string Long { get; set; }

        public string Lat { get; set; }

        public Trips Trip { get; set; }

        public string Category { get; set; }
    }
}