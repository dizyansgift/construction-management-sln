# Construction Management Platform

SLATE is being migrated from the original WPF prototype to a shared .NET platform for office and field teams.

## Solution

- `src/Api`: ASP.NET Core REST API with project and authentication endpoints
- `src/Domain`: construction entities and business enums
- `src/Application`: DTOs and application contracts
- `src/Infrastructure`: EF Core SQL Server persistence and Identity integration
- `src/Web`: Angular 22 responsive management dashboard
- `src/Maui`: .NET MAUI MVVM field application foundation
- Root project: legacy WPF prototype retained during migration

## Current backend features

- Projects CRUD and archive endpoints under `/api/projects`
- Identity registration and JWT login under `/api/auth`
- SQL Server EF Core context with project, BOQ, material, labour, expense, payment, progress, and photo entities
- Environment-based JWT secret loading through `CONSTRUCTION_JWT_KEY`

## Run the API

Set a development secret before starting:

```powershell
$env:CONSTRUCTION_JWT_KEY = "replace-with-a-local-development-secret-at-least-32-characters"
dotnet run --project src/Api/ConstructionManagement.Api.csproj
```

The default development database is LocalDB at `ConstructionManagement`. Override `ConnectionStrings:ConstructionDatabase` for SQL Server or another environment.

## Run Angular

```powershell
cd src/Web
npm install
npm start
```

The Angular dashboard reads project records from `http://localhost:5000/api/projects`.

## Build the solution

```powershell
dotnet build ConstructionManagement.slnx
```

The MAUI workload is required to build `src/Maui` for Windows, Android, and iOS. iOS packaging requires macOS tooling.
