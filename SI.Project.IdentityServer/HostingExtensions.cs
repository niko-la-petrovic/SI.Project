using Duende.IdentityServer;
using SI.Project.IdentityServer;
using SI.Project.IdentityServer.Pages.Admin.ApiScopes;
using SI.Project.IdentityServer.Pages.Admin.Clients;
using SI.Project.IdentityServer.Pages.Admin.IdentityScopes;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Serilog;
using SI.Project.IdentityServer.Data;
using SI.Project.IdentityServer.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;

namespace SI.Project.IdentityServer;

internal static class HostingExtensions
{
    public static WebApplication ConfigureServices(this WebApplicationBuilder builder)
    {
        var services = builder.Services;
        var configuration = builder.Configuration;

        services.AddRazorPages()
            .AddRazorRuntimeCompilation();

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        var identityConnectionString = configuration.GetConnectionString("IdentityConnection");

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseSqlite(identityConnectionString);
        });

        services.AddIdentity<ApplicationUser, IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        var isBuilder = services
            .AddIdentityServer(options =>
            {
                options.Events.RaiseErrorEvents = true;
                options.Events.RaiseInformationEvents = true;
                options.Events.RaiseFailureEvents = true;
                options.Events.RaiseSuccessEvents = true;

                // see https://docs.duendesoftware.com/identityserver/v5/fundamentals/resources/
                options.EmitStaticAudienceClaim = true;
            })
            .AddTestUsers(TestUsers.Users)
            // this adds the config data from DB (clients, resources, CORS)
            .AddConfigurationStore(options =>
            {
                options.ConfigureDbContext = b =>
                    b.UseSqlite(connectionString, dbOpts => dbOpts.MigrationsAssembly(typeof(Program).Assembly.FullName));
            })
            // this is something you will want in production to reduce load on and requests to the DB
            //.AddConfigurationStoreCache()
            //
            // this adds the operational data from DB (codes, tokens, consents)
            .AddOperationalStore(options =>
            {
                options.ConfigureDbContext = b =>
                    b.UseSqlite(connectionString, dbOpts => dbOpts.MigrationsAssembly(typeof(Program).Assembly.FullName));

                // this enables automatic token cleanup. this is optional.
                options.EnableTokenCleanup = true;
                options.RemoveConsumedTokens = true;
            });

        services.AddAuthentication()
            .AddGoogle(options =>
            {
                options.SignInScheme = IdentityServerConstants.ExternalCookieAuthenticationScheme;

                // register your IdentityServer with Google at https://console.developers.google.com
                // enable the Google+ API
                // set the redirect URI to https://localhost:5001/signin-google
                options.ClientId = "copy client ID from Google here";
                options.ClientSecret = "copy client secret from Google here";
            });


        // this adds the necessary config for the simple admin/config pages
        {
            services.AddAuthorization(options =>
                options.AddPolicy("admin",
                    policy => policy.RequireClaim("sub", "1"))
            );

            services.Configure<RazorPagesOptions>(options =>
                options.Conventions.AuthorizeFolder("/Admin", "admin"));

            services.AddTransient<ClientRepository>();
            services.AddTransient<IdentityScopeRepository>();
            services.AddTransient<ApiScopeRepository>();
        }

        // if you want to use server-side sessions: https://blog.duendesoftware.com/posts/20220406_session_management/
        // then enable it
        //isBuilder.AddServerSideSessions();
        //
        // and put some authorization on the admin/management pages using the same policy created above
        //builder.Services.Configure<RazorPagesOptions>(options =>
        //    options.Conventions.AuthorizeFolder("/ServerSideSessions", "admin"));

        return builder.Build();
    }

    public static WebApplication ConfigurePipeline(this WebApplication app)
    {
        app.UseSerilogRequestLogging();

        if (app.Environment.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseStaticFiles();
        app.UseRouting();
        app.UseIdentityServer();
        app.UseAuthorization();

        app.MapRazorPages()
            .RequireAuthorization();

        return app;
    }
}