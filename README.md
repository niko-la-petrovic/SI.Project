Add-Migration -OutputDir Migrations\IdentityDb InitialCreate -Context SI.Project.IdentityServer.Data.ApplicationDbContext -StartupProject SI.Project.IdentityServer

Update-Database -StartupProject SI.Project.IdentityServer -Context SI.Project.IdentityServer.Data.ApplicationDbContext

Remove-Migration -Context SI.Project.IdentityServer.Data.ApplicationDbContext