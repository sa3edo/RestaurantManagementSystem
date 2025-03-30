using System.ComponentModel.DataAnnotations;

namespace RestaurantManagementSystem.DTO
{
    public class LoginDto
    {
        public int Id { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }
        public bool RemeberMe { get; set; }
    }
}
