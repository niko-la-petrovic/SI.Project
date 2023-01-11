namespace SI.Project.IdentityServer.Models;

public abstract class DatedEntity : IDatedEntity
{
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }
}
