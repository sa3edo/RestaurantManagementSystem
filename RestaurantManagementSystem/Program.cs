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
using Utility.Email;
using Microsoft.AspNetCore.Identity.UI.Services;
using Utility.SignalR;

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
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();  // ✅ Registers default token providers
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
builder.Services.AddScoped<IEmailSender, EmailSender>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddSignalR();
builder.Services.Configure<StripeSettings>(builder.Configuration.GetSection("Stripe"));
StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];
builder.Services.AddCustomJwtAuth(builder.Configuration);

// Load appsettings.json and override with appsettings.Development.json in development mode
builder.Configuration.AddEnvironmentVariables();

var emailSettings = new
{
    SmtpServer = builder.Configuration["EmailSettings:SmtpServer"],
    Port = builder.Configuration["EmailSettings:Port"],
    SenderEmail = builder.Configuration["EmailSettings:SenderEmail"],
    SenderPassword = builder.Configuration["EmailSettings:SenderPassword"]
};

var app = builder.Build();
app.MapHub<AdminHub>("/adminHub");
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
