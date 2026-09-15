using ConstructionManagement.Maui.Services;

namespace ConstructionManagement.Maui;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder.UseMauiApp<App>();
        builder.Services.AddSingleton(new HttpClient { BaseAddress = new Uri("https://localhost:7000/") });
        builder.Services.AddSingleton<ProjectApiService>();
        return builder.Build();
    }
}
