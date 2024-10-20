/**
 * 
 * 
 * Image DB Context class
 * Responsible for connecting to the database and creating the tables
 * and configuring the relationships between the tables
 * 
 * /
 * 
 * 
 */

using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using GISImagesAPI.Models;



namespace ImageDBContext {
    public class ImageDBContext : DbContext {
        public ImageDBContext(DbContextOptions<ImageDBContext> options) : base(options) { }

        public DbSet<Trip> Trips { get; set; }


        public DbSet<Image> Images { get; set; }
        public DbSet<Category> Categories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            //set jsonb type for categories in trips
            modelBuilder.Entity<Trip>().Property(t => t.categories)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }),
                    v => JsonSerializer.Deserialize<Category[]>(v, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase })
                )
                .HasColumnType("jsonb");
    }
}