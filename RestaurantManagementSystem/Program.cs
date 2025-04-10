using infrastructures.Repository;
using infrastructures.Repository.IRepository;
using infrastructures.Services;
using infrastructures.Services.IServices;
using infrastructures.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using RestaurantManagementSystem.Models;
using RestaurantManagementSystem.Utility;
using Stripe;
using TestRESTAPI.Extentions;
using Utility.Profiles;
using Utility.Email;
using Microsoft.AspNetCore.Identity.UI.Services;
using Utility.SignalR;
using Utility.Chat;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAutoMapper(typeof(ApplicationUserProfile).Assembly);
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlServerOptions => sqlServerOptions.EnableRetryOnFailure())); // Retry on transient failures

//builder.Services.AddDbContext<ApplicationDbContext>(

//    option => option.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
//    );

builder.Services.Configure<IdentityOptions>(options =>
{
    options.SignIn.RequireConfirmedEmail = true;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(30);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
});

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(option =>
{
    option.User.RequireUniqueEmail = true;


})
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();
builder.Services.AddScoped<IFoodCtegory, FoodCategory>();
builder.Services.AddScoped<IMenuItem, MenuItem>();
builder.Services.AddScoped<IOrder, Order>();
builder.Services.AddScoped<IOrderItem, OrderItem>();
builder.Services.AddScoped<IRestaurant, Restaurant>();
builder.Services.AddScoped<IChat, ChatRepository>();
builder.Services.AddScoped<IReview, infrastructures.Repository.Review>();
builder.Services.AddScoped<IReservation, infrastructures.Repository.Rservation>();
builder.Services.AddScoped<ITimeSlots, TimeSlot>();
builder.Services.AddScoped<ITable, Table>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IAccountService, infrastructures.Services.AccountService>();
builder.Services.AddScoped<IFoodCategoryService, FoodCategoryService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IRestaurantService, RestaurantService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<IOrderItemService, OrderItemService>();
builder.Services.AddScoped<IReviewService, infrastructures.Services.ReviewService>();
builder.Services.AddScoped<ITimeSlotService, TimeSlotService>();
builder.Services.AddScoped<ITableService, TableService>();
builder.Services.AddScoped<IMenuItemService, MenuItemService>();
builder.Services.AddSignalR();
builder.Services.Configure<StripeSettings>(builder.Configuration.GetSection("Stripe"));
StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];
builder.Services.AddCustomJwtAuth(builder.Configuration);
builder.Services.AddHostedService<DataCleanupService>();
//builder.Services.AddScoped<Utility.Email.IEmailSender, EmailSender>();
//builder.Services.AddTransient<Utility.Email.IEmailSender,EmailSender>();
builder.Services.AddTransient<Microsoft.AspNetCore.Identity.UI.Services.IEmailSender, EmailSender>();
// Register EmailSender
// Add services to the container.
builder.Services.AddControllersWithViews();

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

app.UseCors("AllowLocalhost");
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "RestImages")),
    RequestPath = "/RestImages"
});
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "MenuImages")),
    RequestPath = "/MenuImages"
});
//Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.MapHub<AdminHub>("/adminHub");
app.MapHub<ChatHub>("/chatHub");
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();