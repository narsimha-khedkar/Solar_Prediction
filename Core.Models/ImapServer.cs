using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Models
{
    public class ImapServer
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ServerAddress { get; set; }
        public int Port { get; set; }
        public bool RequiresSsl { get; set; }
    }
}
