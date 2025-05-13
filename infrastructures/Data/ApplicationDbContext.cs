using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Models.Chat;
using Models.Models;
using RestaurantManagementSystem.Models;
using Stripe.Climate;
using System.Reflection.Emit;


public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    DbSet<FoodCategory> FoodCategories { get; set; }
    DbSet<MenuItem> MenuItems { get; set; }
    DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Models.Models.Order> Orders { get; set; }
    public DbSet<ChatMessage> Messages { get; set; }
    public DbSet<Conversation> Conversation { get; set; }
    DbSet<Reservation> Reservations { get; set; }
    DbSet<Restaurant> Restaurants { get; set; }
    DbSet<Review> Reviews { get; set; }
    DbSet<TimeSlot> TimeSlots { get; set; }
    DbSet<Table> Tables { get; set; }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
       : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Models.Models.Order>()
    .HasOne(o => o.Customer)
    .WithMany() 
    .HasForeignKey(o => o.UserID)
    .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Models.Models.Order>()
    .HasOne(o => o.Restaurant)
    .WithMany()
    .HasForeignKey(o => o.RestaurantID)
    .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Models.Models.Review>()
   .HasOne(o => o.Customer)
   .WithMany()
   .HasForeignKey(o => o.UserID)
   .OnDelete(DeleteBehavior.Restrict);


        builder.Entity<Reservation>()
            .HasOne(r => r.Restaurant)
            .WithMany(r => r.Reservations)
            .HasForeignKey(r => r.RestaurantID)
            .OnDelete(DeleteBehavior.Restrict);

        
        builder.Entity<TimeSlot>()
            .HasOne(ts => ts.Restaurant)
            .WithMany(r => r.TimeSlot)
            .HasForeignKey(ts => ts.RestaurantID)
            .OnDelete(DeleteBehavior.Restrict); 

        builder.Entity<FoodCategory>()
           .HasOne(fc => fc.Restaurant)
           .WithMany(r => r.foodCategories)
           .HasForeignKey(fc => fc.RestaurantId)
           .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Reservation>()
        .HasOne(r => r.Customer)
        .WithMany()
        .HasForeignKey(r => r.UserID)
        .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Reservation>()
        .HasOne(r => r.TimeSlot)
        .WithMany()
        .HasForeignKey(r => r.TimeSlotID)
        .OnDelete(DeleteBehavior.Restrict);
       
        builder.Entity<Table>()
            .HasOne(t => t.Restaurant)
            .WithMany(r => r.Tables)
            .HasForeignKey(t => t.RestaurantId)
            .OnDelete(DeleteBehavior.Restrict); 

        builder.Entity<OrderItem>()
            .HasOne(oi => oi.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(oi => oi.OrderID)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Entity<ChatMessage>()
           .HasOne(oi => oi.Sender)
           .WithMany()
           .HasForeignKey(oi => oi.SenderId)
           .OnDelete(DeleteBehavior.Restrict);
        builder.Entity<ChatMessage>()
           .HasOne(oi => oi.Receiver)
           .WithMany()
           .HasForeignKey(oi => oi.ReceiverId)
           .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<OrderItem>()
            .HasOne(oi => oi.MenuItem)
            .WithMany(mi => mi.OrderItems)
            .HasForeignKey(oi => oi.MenuItemID)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Restaurant>()
            .HasOne(oi => oi.User)
            .WithMany(o => o.Restaurants)
            .HasForeignKey(oi => oi.ManagerID)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ApplicationUser>()
            .HasIndex(u => u.UserName)
            .IsUnique(false);

        builder.Entity<ApplicationUser>()
            .HasIndex(u => u.NormalizedUserName)
            .IsUnique(false);

        builder.Entity<IdentityUser>()
            .HasIndex(u => u.Email)
            .IsUnique(true);

        builder.Entity<IdentityUser>()
            .HasIndex(u => u.NormalizedUserName)
            .IsUnique(false);
        builder.Entity<Conversation>()
        .HasOne(c => c.Vendor)
        .WithMany()
        .HasForeignKey(c => c.VendorId)
        .OnDelete(DeleteBehavior.Restrict); // أو DeleteBehavior.NoAction

        // تعديل علاقة Conversation مع User
        builder.Entity<Conversation>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // تعديل علاقة ChatMessage مع Conversation
        builder.Entity<ChatMessage>()
            .HasOne(m => m.Conversation)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Restrict);


    }
}