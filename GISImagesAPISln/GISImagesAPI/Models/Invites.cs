/**
 * 
 * 
 * Invites Model
 * 
 * Id
 * Code
 * TripId
 * Email
 * CreatedAt
 * ExpiredAt
 *  
 * 
 * 
 * /
 * 
 */

namespace GISImagesAPI.Models

{
    public class Invites
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }
        public string Code { get; set; }

        
        public Guid TripId { get; set; }
        public Trips Trip { get; set; }
        public string Email { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiredAt { get; set; }
    }
}