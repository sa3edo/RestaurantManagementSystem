using infrastructures.Repository;
using infrastructures.Repository.IRepository;
using infrastructures.Services;
using infrastructures.Services.IServices;
using infrastructures.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using RestaurantManagementSystem.Models;
using infrastructures.Services;
using RestaurantManagementSystem.Utility;
using Stripe;
using TestRESTAPI.Extentions;
using Utility.Profiles;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAutoMapper(typeof(ApplicationUserProfile).Assembly);
builder.Services.AddDbContext<ApplicationDbContext>(
    option => option.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
    );
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
.AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddScoped<IFoodCtegory, FoodCategory>();
builder.Services.AddScoped<IMenuItem, MenuItem>();
builder.Services.AddScoped<IOrder, Order>();
builder.Services.AddScoped<IOrderItem, OrderItem>();
builder.Services.AddScoped<IRestaurant, Restaurant>();
builder.Services.AddScoped<IReview,infrastructures.Repository.Review>();
builder.Services.AddScoped<IReservation, infrastructures.Repository.Rservation>();
builder.Services.AddScoped<ITimeSlots,TimeSlot>();
builder.Services.AddScoped<IUnitOfWork,UnitOfWork>();
builder.Services.AddScoped<IAccountService,infrastructures.Services.AccountService>();

builder.Services.Configure<StripeSettings>(builder.Configuration.GetSection("Stripe"));
StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];
builder.Services.AddCustomJwtAuth(builder.Configuration);
var app = builder.Build();
app.UseCors("AllowLocalhost");
app.UseStaticFiles();
//app.UseStaticFiles(new StaticFileOptions
//{
//    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "Images")),
//    RequestPath = "/Images"
//});
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
