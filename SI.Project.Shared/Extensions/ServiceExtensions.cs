using EasyNetQ;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SI.Project.Shared.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SI.Project.Shared.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddRmq(this IServiceCollection services, ConfigurationManager configuration)
    {
        if (configuration.GetSection("RMQ:Enabled").Get<bool>())
            services.RegisterEasyNetQ(resolver =>
            {
                var settings = configuration.GetSection("RMQ:Settings").Get<RMQConnectionSettings>();

                var host = new HostConfiguration
                {
                    Host = settings.Host,
                    Port = (ushort)settings.Port
                };
                host.Ssl.Enabled = true;
                host.Ssl.ServerName = settings.Host;
                host.Ssl.CertPath = settings.CertPath;
                host.Ssl.CertPassphrase = settings.CertPassword;

                var connectionConfig = new ConnectionConfiguration
                {
                    Hosts = new List<HostConfiguration> { host },
                    UserName = settings.Username,
                    Password = settings.Password,
                };
                connectionConfig.VirtualHost = settings.VirtualHost;


                return connectionConfig;
            }, register =>
            {
                register.EnableSystemTextJson();
            });

        return services;
    }
}
