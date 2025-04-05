using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

    public class EmailSender : IEmailSender
    {
        private readonly IConfiguration _configuration;

        public EmailSender(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            try
            {
                var smtpServer = _configuration["EmailSettings:SmtpServer"];
                var port = int.Parse(_configuration["EmailSettings:Port"]);
                var senderEmail = _configuration["EmailSettings:SenderEmail"];
                var senderPassword = _configuration["EmailSettings:SenderPassword"];

                using (var client = new SmtpClient())
                {
                    client.Host = smtpServer;
                    client.Port = port;
                    client.EnableSsl = true;
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(senderEmail, senderPassword);
                    client.DeliveryMethod = SmtpDeliveryMethod.Network;
                    client.Timeout = 20000; // 20 second timeout

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(senderEmail),
                        Subject = subject,
                        Body = htmlMessage,
                        IsBodyHtml = true
                    };

                    mailMessage.To.Add(email);

                    // Add this line to help with Gmail authentication
                    ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

                    await client.SendMailAsync(mailMessage);
                    Console.WriteLine($"Email sent successfully to {email}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send email to {email}. Error: {ex.ToString()}");
                throw;
            }
        }

    }
