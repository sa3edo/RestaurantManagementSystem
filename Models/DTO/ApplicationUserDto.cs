using System.ComponentModel.DataAnnotations;

namespace RestaurantManagementSystem.DTO
{
    public class ApplicationUserDto
    {
        public int Id { get; set; }
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }
        [Required]
        [DataType(DataType.Password)]
        public string Passwords { get; set; }
      
    }
}
