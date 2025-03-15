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
    DbSet<TimeSlot> TimeSlots { get; set; }
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
       : base(options)
    {
    }
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Define Composite Key
        builder.Entity<OrderItem>()
            .HasKey(oi => new { oi.OrderID, oi.MenuItemID });

        
        builder.Entity<OrderItem>()
            .HasOne(oi => oi.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(oi => oi.OrderID)
            .OnDelete(DeleteBehavior.NoAction); 

       
        builder.Entity<OrderItem>()
            .HasOne(oi => oi.MenuItem)
            .WithMany(mi => mi.OrderItems)
            .HasForeignKey(oi => oi.MenuItemID)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Reservation>()
          .HasOne(r => r.Customer)
          .WithMany()
          .HasForeignKey(r => r.UserID)

          .OnDelete(DeleteBehavior.NoAction);

        builder.Entity<Reservation>()
            .HasOne(r => r.Restaurant)
            .WithMany(rt => rt.Reservations)
            .HasForeignKey(r => r.RestaurantID)
            .OnDelete(DeleteBehavior.NoAction); 

        
        builder.Entity<Reservation>()
            .HasOne(r => r.TimeSlot)
            .WithMany(ts => ts.Reservations)
            .HasForeignKey(r => r.TimeSlotID)
            .OnDelete(DeleteBehavior.NoAction);  

       
        builder.Entity<TimeSlot>()
            .HasOne(ts => ts.Restaurant)
            .WithMany(r => r.TimeSlot)
            .HasForeignKey(ts => ts.RestaurantID)
            .OnDelete(DeleteBehavior.Cascade);
    }

}
