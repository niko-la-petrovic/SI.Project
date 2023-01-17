using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SI.Project.Shared.Models.Messaging;

public class ProcessedMessagePart
{
    public MessagePart MessagePart { get; set; }
    public DateTime ProcessedAt { get; set; }
    public string ServerId { get; set; }
}
