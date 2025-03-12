using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Models.Models;
using RestaurantManagementSystem.Models;
using Stripe.Climate;


public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    DbSet<FoodCategory> FoodCategories { get; set; }
    DbSet<MenuItem> MenuItems { get; set; }
    DbSet<OrderItem> OrderItems { get; set; }
    DbSet<Models.Models.Order> Orders { get; set; }
    DbSet<Reservation> Reservations { get; set; }
    DbSet<Restaurant> Restaurants { get; set; }
    DbSet<Review> Reviews { get; set; }
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
       : base(options)
    {
    }
}
