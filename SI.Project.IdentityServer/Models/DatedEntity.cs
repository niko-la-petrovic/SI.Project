namespace SI.Project.IdentityServer.Models;

public abstract class DatedEntity
{
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }
}
