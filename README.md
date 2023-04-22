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

Remove-Migration -Context SI.Project.IdentityServer.Data.ApplicationDbContext0

## Slike


![FireShot Capture 005 - Duende IdentityServer ![FireShot Capture 007 - SNI ClientApp - sni-app niko-la-petrovic ddnsfree com](https://user-images.githubusercontent.com/23142144/233781158-785604be-4614-4df9-9239-28cd2f3b5cba.png)
- sni-auth niko-la-petrovic ddnsfree com](https://user-images.githubusercontent.co![FireShot Capture 006 - SNI ClientApp - sni-app niko-la-petrovic ddns![FireShot Capture 008 - SNI ClientApp - sni-app niko-la-petrovic ddnsfree com](https://user-images.githubusercontent.com/23142144/233781164-2ba7b367-6550-4d47-abc4-21990f23de7a.png)
free com](https://user-images.githubusercontent.com/23142144/233781155-d9271081-95ae-430d-9306-bda8aedd92f8.png)
m/23142144/233781152-4b8b9035-343e-401e-ac5e-13cf94f5afb3.png)
![FireShot Capture 009 - SNI ClientApp - sni-app niko-la-petrovic ddnsfree com](https://user-images.githubusercontent.com/23142144/233781166-a1fbe2f0-0981-4617-ab06-1c5c019e8b5c.png)
![FireShot Capture 010 - SNI ClientApp - sni-app niko-la-petrovic ddnsfree com](https://user-images.githubusercontent.com/23142144/233781167-53a0baae-84b9-4d93-b2ec-682a34a46cad.png)
![FireShot Capture 011 - SNI ClientApp - sni-app niko-la-petrovic ddnsfree com](https://user-images.githubusercontent.com/23142144/233781171-c8789c69-6e6f-4a6f-b922-5e2cc26ea7ef.png)
![FireShot Capture 012 - SNI ClientApp - sni-app niko-la-petrovic ddnsfree com](https://user-images.githubusercontent.com/23142144/233781177-21065fb0-30e6-4c0a-b8e3-f0c6e731dd4c.png)
![1f787b52-350a-4301-afaf-1d6e9b854107](https://user-images.githubusercontent.com/23142144/233781182-380cc4e8-f730-4129-8f66-d050b8e81f37.png)
![04c2a953-6980-408f-a5f8-7c19b02e714b](https://user-images.githubusercontent.com/23142144/233781197-db9c67ec-2c6d-41d6-8730-598cdffca3ff.png)
![8faaf340-34cd-413e-b25a-4c3fcfa451af](https://user-images.githubusercontent.com/23142144/233781199-a263f96d-b284-473a-a5f3-61b71a90911f.png)
![9d13a1d1-4e81-4d9e-aa1c-36c1c0eb58fa](https://user-images.githubusercontent.com/23142144/233781201-e807af74-26bb-4e7a-913d-09bca812f1a4.png)
![35cd239d-bf5d-4e39-845d-b05c2fc2ba72](https://user-images.githubusercontent.com/23142144/233781203-2b8d346e-ee42-4bec-a232-9bdde320dbd9.png)
![70d6d92d-7f7b-426a-83c5-340bd03c7563](https://user-images.githubusercontent.com/23142144/233781205-ef6b445c-5b1f-4058-98d9-4d535ec44370.png)
![618e126e-5fa7-4e1c-b725-f026d2b91fb6](https://user-images.githubusercontent.com/23142144/233781208-29a6128d-59c6-4f1d-a511-25faf52c6a63.png)
![2215a12c-1079-4f5b-8cab-dafd5755a3d4](https://user-images.githubusercontent.com/23142144/233781210-99d866e0-ea69-4895-bdee-c4cc83b7e133.png)
![10730ec2-2752-4d6f-a494-ad9e205fe1e2](https://user-images.githubusercontent.com/23142144/233781213-f5002a25-8991-44e4-a771-36f9dbdb7e22.png)
![b9969464-0300-486f-8b8c-801357ace09f](https://user-images.githubusercontent.com/23142144/233781215-2bbff61f-eb86-4457-b682-77e4736a6190.png)
![bc2b464f-e7be-4ffc-8c57-2329b3a36cc8](https://user-images.githubusercontent.com/23142144/233781218-8c042f36-ae13-41c5-afba-efc3f47e0615.png)
![bcc6704a-a96f-44eb-bd00-ccae1aea27db](https://user-images.githubusercontent.com/23142144/233781220-a7523d9c-6563-4c91-a20b-efaa72552dcc.png)
![c56fe16e-8bb1-4c97-b48a-f86aa5b8c766](https://user-images.githubusercontent.com/23142144/233781223-197d3bdb-da46-43b6-bbdc-7cdfa9ee525a.png)
![faa6c358-c14f-46eb-b3d2-276bb4c11d4f](https://user-images.githubusercontent.com/23142144/233781224-9284fd85-669c-4996-9a20-6d25b0b4c41f.png)
![b26aabcf-7518-48a3-8b6e-afabc547e837](https://user-images.githubusercontent.com/23142144/233781525-1bf8a263-514b-42c0-9284-f3f903f80380.png)
