namespace SI.Project.IdentityServer.Models;

public interface IDatedEntity
{
    DateTime CreatedDate { get; set; }
    DateTime UpdatedDate { get; set; }
}