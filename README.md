# SI.Project

## Komponente sistema

1. Identity Server - OAuth2.0 + OIDC - Identity & Access Management. Rutiranje poruka prema i iz MQ sistema
2. "API" - servisi za MQ obradu poruka
3. ClientApp - korisnicka aplikacija
4. RabbitMQ instanca
5. YARP - reverse proxy

## Potrebni alati

Za .NET komponente - Identity Server, API, ClientApp i YARP - potreban .NET 7.0

Za Node.Js komponente - ClientApp - potreban Node.Js 16.14.0

## Konfiguracija

Za .NET komponente - appsettings[.{OKRUZENJE}].json i launchSettings.json
Za Node.Js komponente - .env[.{OKRUZENJE}]

## Pokretanje u razvojnom modu

Za .NET komponente
`dotnet run --launch-profile {LAUNCH_PROFILE}`

Za Node.Js komponente
`yarn dev`

## Pokretanje u produkcionom modu

Za .NET komponente
`dotnet run`

Za Node.Js komponente
`yarn build; yarn start;`

## Entity Framework - Rad sa migracijama

Add-Migration -OutputDir Migrations\IdentityDb InitialCreate -Context SI.Project.IdentityServer.Data.ApplicationDbContext -StartupProject SI.Project.IdentityServer

Update-Database -StartupProject SI.Project.IdentityServer -Context SI.Project.IdentityServer.Data.ApplicationDbContext

Remove-Migration -Context SI.Project.IdentityServer.Data.ApplicationDbContext
