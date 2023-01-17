namespace SI.Project.Shared.Configuration;

public class RMQConnectionSettings
{
    public string Host { get; set; }
    public int Port { get; set; }
    public string VirtualHost { get; set; }
    public string CertPath { get; set; }
    public string? CertPassword { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
}
