using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Database.EntityFramework.EntityTypeConfigurations
{
    public class ImapServerTypeConfiguration : IEntityTypeConfiguration<ImapServer>
    {
        public void Configure(EntityTypeBuilder<ImapServer> builder)
        {
            builder.HasKey(o => o.Id);

            builder.HasData(new ImapServer()
                { Id = 1, Name = "Google", ServerAddress = "imap.gmail.com", Port = 993, RequiresSsl = true });

            builder.HasData(new ImapServer()
                { Id = 2, Name = "Outlook", ServerAddress = "imap-mail.outlook.com", Port = 993, RequiresSsl = true });
        }
    }
}
