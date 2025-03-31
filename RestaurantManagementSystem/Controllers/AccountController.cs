using infrastructures.Services.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using RestaurantManagementSystem.DTO;
using RestaurantManagementSystem.Models;
using System.Threading.Tasks;

namespace RestaurantManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailSender _emailSender;
        private readonly IConfiguration _configuration;

        public AccountController(
            IAccountService accountService,
            UserManager<ApplicationUser> userManager,
            IEmailSender emailSender,
            IConfiguration configuration)
        {
            _accountService = accountService;
            _userManager = userManager;
            _emailSender = emailSender;
            _configuration = configuration;
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register(ApplicationUserDto userDto)
        {
            var result = await _accountService.RegisterAsync(userDto);
            return Ok(result);
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginDto userVm)
        {
            var result = await _accountService.LoginAsync(userVm);
            return Ok(result);
        }

        [HttpGet("ConfirmEmail")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            var result = await _accountService.ConfirmEmailAsync(userId, token);
            if (result)
            {
                return Redirect($"{_configuration["FrontendUrl"]}/login");
            }
            return Redirect($"{_configuration["FrontendUrl"]}/email-verification-failed");
        }


        [HttpPost("ResendVerificationEmail")]
        public async Task<IActionResult> ResendVerificationEmail([FromBody] string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return BadRequest(new { Message = "User not found." });
            }

            if (user.EmailConfirmed)
            {
                return BadRequest(new { Message = "Email is already verified." });
            }

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var confirmationLink = $"{_configuration["FrontendUrl"]}/verify-email?userId={user.Id}&token={Uri.EscapeDataString(token)}";

            await _emailSender.SendEmailAsync(
                user.Email,
                "Email Confirmation",
                $"Click here to verify your email: <a href='{confirmationLink}'>Verify Email</a>");

            return Ok(new { Message = "Verification email sent successfully." });
        }
        [HttpPost("test-email")]
        public async Task<IActionResult> TestEmail()
        {
            try
            {
                await _emailSender.SendEmailAsync("recipient@example.com", "Test Email", "<h1>This is a test</h1>");
                return Ok("Test email sent successfully");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

    }
}