using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace RestaurantManagementSystem.Models
{
    public class ApplicationUser :IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? Name { get; set; }
        public string? VerificationCode { get; set; }
        [ValidateNever]
        [JsonIgnore]
        public IEnumerable<Restaurant>? Restaurants { get; set; }


    }
}
