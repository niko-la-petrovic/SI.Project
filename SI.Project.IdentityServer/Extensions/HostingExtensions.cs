using Duende.IdentityServer;
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
using Microsoft.AspNetCore.Authentication.JwtBearer;
using SI.Project.IdentityServer.Hubs;
using SI.Project.IdentityServer.Authorization;
using System.IdentityModel.Tokens.Jwt;
using IdentityModel.OidcClient;
using Hellang.Middleware.ProblemDetails;
using SI.Project.IdentityServer.Services.Identity;

namespace SI.Project.IdentityServer.Extensions;

internal static class HostingExtensions
{
    public static WebApplication ConfigureServices(this WebApplicationBuilder builder)
    {
        var services = builder.Services;
        var configuration = builder.Configuration;
        var env = builder.Environment;

        services.AddCors(options =>
        {
            options.AddPolicy(name: CorsPolicies.AllowClientApp, builder =>
            {
                var allowedOrigins = configuration.GetSection("Cors:AllowClientApp").Get<string[]>();
                builder.WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        services
            .AddProblemDetails(env)
            .AddControllers()
            .AddProblemDetailsConvention(env);
        services.AddSignalR();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();

        services.AddRazorPages()
            .AddRazorRuntimeCompilation();

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        var identityConnectionString = configuration.GetConnectionString("IdentityConnection");

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseSqlite(identityConnectionString);
        });

        services.AddIdentity<ApplicationUser, IdentityRole>(options =>
        {
            options.User.RequireUniqueEmail = true; // TODO migration for unique index?
        })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddUserManager<SIUserManager>()
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
            })
            .AddAspNetIdentity<ApplicationUser>();


        services.AddAuthentication()
        .AddJwtBearer(options =>
        {
            var authority = configuration.GetSection("Auth:IdentityServer:Authority").Get<string>();
            options.Authority = authority;
            options.TokenValidationParameters.ValidateAudience = false;
            options.TokenValidationParameters.ValidTypes = new[] { "at+jwt" };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];

                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(path) && path.StartsWithSegments("/hubs"))
                        context.Token = accessToken;

                    return Task.CompletedTask;
                },
                // TODO move to API
                //OnTokenValidated = async (context) =>
                //{
                //    //context.HttpContext.RequestServices // TODO use
                //    // TODO use usermanager here with sub claim
                //    if (context.SecurityToken is JwtSecurityToken jwt)
                //    {
                //        var accessToken = jwt.RawData;
                //        var oidcClient = new OidcClient(new OidcClientOptions
                //        {
                //            Authority = authority,
                //        });
                //        var userInfoResult = await oidcClient.GetUserInfoAsync(accessToken);
                //        if (userInfoResult.IsError)
                //            throw new Exception(userInfoResult.ErrorDescription); // TODO

                //        var claims = userInfoResult.Claims;
                //        var claimsIdentity = new System.Security.Claims.ClaimsIdentity(claims);
                //        context.Principal.AddIdentity(claimsIdentity);
                //    }
                //}
            };
        })
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
                    policy => policy.RequireClaim("role", "admin"))
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

        services.AddBusinessServices();

        return builder.Build();
    }

    public static WebApplication ConfigurePipeline(this WebApplication app)
    {
        app.UseSerilogRequestLogging();

        if (app.Environment.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseCors(CorsPolicies.AllowClientApp);
        app.UseProblemDetails();

        app.UseStaticFiles();
        app.UseRouting();
        app.UseIdentityServer();
        app.UseAuthorization();

        app.MapHubs();

        app.MapRazorPages()
            .RequireAuthorization();

        app.MapControllers();

        return app;
    }

    public static WebApplication MapHubs(this WebApplication app)
    {
        app.MapHub<ClientOnlineHub>("/hubs/client-online");
        return app;
    }
}