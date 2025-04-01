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
using Microsoft.AspNetCore.Http.HttpResults;
using System.Net.Mail;
using System.Net;
using Models.DTO;

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
           // user.EmailConfirmed = false; // Important for email verification
            var result = await _userManager.CreateAsync(user, userDto.Passwords);

            if (result.Succeeded)
            {
                if (_userManager.Users.Count() == 1) // First user is admin
                {
                    await _userManager.AddToRoleAsync(user, SD.adminRole);
                }
                else
                {
                    await _userManager.AddToRoleAsync(user, SD.CustomerRole);
                }

                //Generate email confirmation token
        //        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        //        var confirmationLink = $"{_configuration["FrontendUrl"]}/confirm-email?userId={user.Id}&token={WebUtility.UrlEncode(token)}";

        //        //Email content
        //        var emailSubject = "Confirm Your Email";
        //        var emailBody = $@"
        //    <h2>Welcome to Our Service!</h2>
        //    <p>Please confirm your email by clicking the link below:</p>
        //    <p><a href='{confirmationLink}'>Confirm Email</a></p>
        //    <p>If you didn't request this, please ignore this email.</p>
        //";

        //        // Send email
        //        await _emailSender.SendEmailAsync(user.Email, emailSubject, emailBody);

                return new { Message = "Registration successful" };
            }

            return new { Errors = result.Errors.Select(e => e.Description) };
        }

        

        public async Task<object> LoginAsync(LoginDto userVm)
        {
            var user = await _userManager.FindByEmailAsync(userVm.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, userVm.Password))
            {
                return new { Message = "Invalid credentials" };
            }

            //if (!user.EmailConfirmed)
            //{
            //    return new { Message = "Please verify your email before logging in.", StatusCode = 403 };
            //}

            if (await _userManager.IsLockedOutAsync(user))
            {
                return new { Message = "Your account is locked. Please try again later or contact support.", StatusCode = 401 };
            }

            var claims = new List<Claim> {

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

        public async Task<object> ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                // Don't reveal that the user doesn't exist
                return new { Message = "If your email exists in our system, you will receive a password reset link." };
            }

            // Generate password reset token
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            // Create reset link
            var resetLink = $"{_configuration["FrontendUrl"]}/reset-password?email={email}&token={WebUtility.UrlEncode(token)}";

            // Email content
            var emailSubject = "Password Reset Request";
            var emailBody = $@"
        <h2>Password Reset</h2>
        <p>You requested to reset your password. Please click the link below to set a new password:</p>
        <p><a href='{resetLink}'>Reset Password</a></p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Reset link: {resetLink}</p>";

            // Send email
            await _emailSender.SendEmailAsync(email, emailSubject, emailBody);

            return new { Message = "Password reset link has been sent to your email." };
        }

        public async Task<object> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);
            if (user == null)
            {
                return new { Message = "Invalid email address." };
            }

            var result = await _userManager.ResetPasswordAsync(
                user,
                resetPasswordDto.Token,
                resetPasswordDto.NewPassword);

            if (result.Succeeded)
            {
                return new { Message = "Password has been reset successfully." };
            }

            return new { Errors = result.Errors.Select(e => e.Description) };
        }

        public async Task<object> ChangePasswordAsync(ChangePasswordDto changePasswordDto)
        {
            var user = await _userManager.FindByIdAsync(changePasswordDto.UserId);
            if (user == null)
            {
                return new { Message = "User not found." };
            }

            var result = await _userManager.ChangePasswordAsync(
                user,
                changePasswordDto.CurrentPassword,
                changePasswordDto.NewPassword);

            if (result.Succeeded)
            {
                return new { Message = "Password has been changed successfully." };
            }

            return new { Errors = result.Errors.Select(e => e.Description) };
        }

    }
}
