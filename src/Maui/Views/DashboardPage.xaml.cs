using ConstructionManagement.Maui.ViewModels;

namespace ConstructionManagement.Maui.Views;

public partial class DashboardPage : ContentPage
{
    private readonly DashboardViewModel viewModel = new();

    public DashboardPage()
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await viewModel.LoadAsync();
    }
}
