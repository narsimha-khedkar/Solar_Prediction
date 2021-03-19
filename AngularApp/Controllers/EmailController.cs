using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Services.Dtos;
using Spire.Email.IMap;
using Spire.Email.Pop3;

namespace AngularApp.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class EmailController : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var emails= new List<EmailDto>();
            //Create a POP3 client  
            var emailClient = new ImapClient("imap.gmail.com", 993, "csci4140spring2021@gmail.com", "Pa$$word1!", ConnectionProtocols.Ssl);
            //Set host, username, password etc. for the client  
            emailClient.Host = "outlook.office365.com";
            emailClient.Username = "LeonDavisLD@outlook.com";
            emailClient.Password = "password";
            emailClient.Port = 995;

            emailClient.Connect();

            
            return Ok(emails);

        }
    }
}
