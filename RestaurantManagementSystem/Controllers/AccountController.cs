using infrastructures.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Models.DTO;
using RestaurantManagementSystem.DTO;
using RestaurantManagementSystem.Models;
using System.Security.Claims;
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

        public AccountController(
            IAccountService accountService,
            UserManager<ApplicationUser> userManager,
            IEmailSender emailSender)
        {
            _accountService = accountService;
            _userManager = userManager;
            _emailSender = emailSender;
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

        [HttpPost("ForgotPassword")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] string email)
        {
            var result = await _accountService.ForgotPasswordAsync(email);
            return Ok(result);
        }

        [HttpPost("ResetPassword")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            var result = await _accountService.ResetPasswordAsync(resetPasswordDto);
            return Ok(result);
        }
        
        [HttpPut("ChangeCurrentPassword")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
       
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            changePasswordDto.UserId = userId;

            var result = await _accountService.ChangePasswordAsync(changePasswordDto);
            return Ok(result);
        }

    }
}