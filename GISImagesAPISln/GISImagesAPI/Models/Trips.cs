

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


/**
 * 
 * Trips Model Class 
 * 
 * Typescript Version:
 * 
 * .createTable('trips', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('description');
    table.integer('user_id').references('users.id').onDelete('CASCADE');
    table.date('start_date');
    table.date('end_date');
    table.timestamps(true, true);
  });

      .table('trips', (table) => {
      table.json('categories').notNullable().defaultTo('[]');
    })

    type Category = {
    name : string;
    type Category = {
  category: string;
  start_date: string;
  end_date: string;
  child_categories: Category[];
};
 * 
 */
namespace GISImagesAPI.Models
{
    public class Category
    {
        public string Name { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public List<Category> ChildCategories { get; set; }
    }

    public class Trip
    {   
        //postgres auto generated uuid
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int UserId { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }


        [Column(TypeName = "jsonb")]
        public List<Category> Categories { get; set; }
    }
}