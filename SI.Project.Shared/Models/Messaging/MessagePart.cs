namespace SI.Project.Shared.Models.Messaging;

public class MessagePart
{
    public string Id { get; set; }
    public string SenderId { get; set; }
    public string ReceiverId { get; set; }
    public int PartIndex { get; set; }
    public int PartsCount { get; set; }
    public string Encrypted { get; set; }
    public string Hash { get; set; }
    public string HashAlgorithm { get; set; }
    public string Signature { get; set; }
}
