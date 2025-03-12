using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using RestaurantManagementSystem.Models;
using Stripe;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//builder.Services.AddAutoMapper(typeof(ApplicationUserProfile).Assembly);
builder.Services.AddDbContext<ApplicationDbContext>(
    option => option.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
    );
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
.AddEntityFrameworkStores<ApplicationDbContext>();
//builder.Services.Configure<StripeSettings>(builder.Configuration.GetSection("Stripe"));
//StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];
//builder.Services.AddCustomJwtAuth(builder.Configuration);
var app = builder.Build();
//app.UseCors("AllowLocalhost");
//app.UseStaticFiles();
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
