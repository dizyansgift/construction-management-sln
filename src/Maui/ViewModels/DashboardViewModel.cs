using System.Collections.ObjectModel;
using ConstructionManagement.Maui.Models;
using ConstructionManagement.Maui.Services;
using Microsoft.Maui.Controls;

namespace ConstructionManagement.Maui.ViewModels;

public sealed class DashboardViewModel : BindableObject
{
    private readonly ProjectApiService projectApiService;
    public ObservableCollection<ProjectModel> Projects { get; } = [];
    public Command RefreshCommand { get; }
    public bool IsBusy { get; private set; }

    public DashboardViewModel(ProjectApiService? projectApiService = null)
    {
        this.projectApiService = projectApiService ?? new ProjectApiService(new HttpClient { BaseAddress = new Uri("https://localhost:7000/") });
        RefreshCommand = new Command(async () => await LoadAsync());
    }

    public async Task LoadAsync()
    {
        if (IsBusy) return;
        IsBusy = true;
        OnPropertyChanged(nameof(IsBusy));
        Projects.Clear();
        foreach (var project in await projectApiService.GetProjectsAsync()) Projects.Add(project);
        IsBusy = false;
        OnPropertyChanged(nameof(IsBusy));
    }
}
