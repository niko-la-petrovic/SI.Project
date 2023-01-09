
using Hellang.Middleware.ProblemDetails;
using Hellang.Middleware.ProblemDetails.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using SI.Project.IdentityServer.Exceptions;
using System.Reflection.Metadata.Ecma335;

namespace SI.Project.IdentityServer.Extensions;

public static class ProblemDetailsExtensions
{
    public static IServiceCollection AddProblemDetails(this IServiceCollection services, IWebHostEnvironment env)
    {
        services.AddProblemDetails(ConfigureProblemDetails(env));
        return services;
    }

    private static Action<Hellang.Middleware.ProblemDetails.ProblemDetailsOptions> ConfigureProblemDetails(IWebHostEnvironment env)
    {
        return (options) =>
        {
            options.IncludeExceptionDetails = (ctx, ex) => env.IsDevelopment();

            options.Rethrow<NotSupportedException>();

            options.MapToStatusCode<NotFoundException>(StatusCodes.Status404NotFound);
            options.MapToStatusCode<ArgumentException>(StatusCodes.Status400BadRequest);
            options.MapToStatusCode<ArgumentNullException>(StatusCodes.Status400BadRequest);
            options.MapToStatusCode<NotImplementedException>(StatusCodes.Status501NotImplemented);
            options.MapToStatusCode<HttpRequestException>(StatusCodes.Status503ServiceUnavailable);
            options.MapToStatusCode<Exception>(StatusCodes.Status500InternalServerError);
        };
    }

    public static IServiceCollection AddProblemDetailsConvention(this IMvcBuilder builder, IWebHostEnvironment env)
    {
        builder.AddProblemDetailsConventions();
        return builder.Services;
    }

    private static string GetHttpStatusCodeUrl(int statusCode)
    {
        return $"https://httpstatuses.com/{statusCode}";
    }
}
