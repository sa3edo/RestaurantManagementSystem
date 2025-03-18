using AutoMapper;
using infrastructures.Services.IServices;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using RestaurantManagementSystem.DTO;
using RestaurantManagementSystem.Models;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using RestaurantManagementSystem.Utility;
using Microsoft.AspNetCore.Identity.UI.Services;

namespace infrastructures.Services
{
    public class AccountService : IAccountService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly IEmailSender _emailSender;

        public AccountService(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IMapper mapper,
            IConfiguration configuration,
            IEmailSender emailSender)  // Inject Email Sender
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _mapper = mapper;
            _configuration = configuration;
            _emailSender = emailSender;
        }

        public async Task<object> RegisterAsync(ApplicationUserDto userDto)
        {
            if (!_roleManager.Roles.Any())
            {
                await _roleManager.CreateAsync(new IdentityRole(SD.adminRole));
                await _roleManager.CreateAsync(new IdentityRole(SD.RestaurantManagerRole));
                await _roleManager.CreateAsync(new IdentityRole(SD.CustomerRole));
            }

            var user = _mapper.Map<ApplicationUser>(userDto);
            user.EmailConfirmed = false; // Require email confirmation
            var result = await _userManager.CreateAsync(user, userDto.Passwords);

            if (result.Succeeded)
            {
                bool isFirstUser = !_userManager.Users.Any();
                string role = isFirstUser ? SD.adminRole : SD.CustomerRole;

                if (!await _roleManager.RoleExistsAsync(role))
                {
                    await _roleManager.CreateAsync(new IdentityRole(role));
                }
                await _userManager.AddToRoleAsync(user, role);

                // Generate Email Confirmation Token
                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var confirmationLink = $"{_configuration["FrontendUrl"]}/verify-email?userId={user.Id}&token={Uri.EscapeDataString(token)}";

                // Send Email
                await _emailSender.SendEmailAsync(user.Email, "Email Confirmation", $"Click here to verify your email: <a href='{confirmationLink}'>Verify Email</a>");

                return new { Message = "Registration successful. Please check your email to verify your account." };
            }

            return new { Errors = result.Errors.Select(e => e.Description) };
        }

        public async Task<bool> ConfirmEmailAsync(string userId, string token)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return false;

            var result = await _userManager.ConfirmEmailAsync(user, token);
            return result.Succeeded;
        }

        public async Task<object> LoginAsync(LoginDto userVm)
        {
            var user = await _userManager.FindByNameAsync(userVm.UserName);
            if (user == null || !await _userManager.CheckPasswordAsync(user, userVm.Password))
            {
                return new { Message = "Invalid credentials" };
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var roles = await _userManager.GetRolesAsync(user);
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                issuer: _configuration["JWT:Issuer"],
                audience: _configuration["JWT:Audience"],
                expires: DateTime.Now.AddDays(14),
                signingCredentials: creds
            );

            return new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                expiration = token.ValidTo
            };
        }
    }
}
