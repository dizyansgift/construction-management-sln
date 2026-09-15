using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using ConstructionManagement.Models;

namespace ConstructionManagement;

public partial class MainWindow : Window
{
    private readonly List<Project> projects =
    [
        new() { Name = "Riverside Medical Pavilion", Customer = "Riverside Health", Location = "Portland, OR", EstimatedBudget = 1800000, ActualCost = 1224000, ProgressPercent = 68, Status = "On track" },
        new() { Name = "Northline Apartments", Customer = "Northline Living", Location = "Tacoma, WA", EstimatedBudget = 1450000, ActualCost = 609000, ProgressPercent = 42, Status = "Needs review" },
        new() { Name = "Cedar Street Retail", Customer = "Cedar Street LLC", Location = "Eugene, OR", EstimatedBudget = 850000, ActualCost = 714000, ProgressPercent = 84, Status = "On track" }
    ];

    public MainWindow()
    {
        InitializeComponent();
        RenderProjects();
    }

    private void Overview_Click(object sender, RoutedEventArgs e) => ShowStatus("Overview is already open.");

    private void Module_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button button && button.Tag is string module)
        {
            if (module == "Projects")
            {
                ShowProjectsWindow();
                return;
            }

            ShowWorkspace(module);
        }
    }

    private void Projects_Click(object sender, RoutedEventArgs e) => ShowProjectsWindow();
    private void Schedule_Click(object sender, RoutedEventArgs e) => ShowWorkspace("Schedule");
    private void Search_Click(object sender, RoutedEventArgs e) => ShowWorkspace("Search");
    private void Notifications_Click(object sender, RoutedEventArgs e) => ShowWorkspace("Notifications");
    private void DateFilter_Click(object sender, RoutedEventArgs e) => ShowWorkspace("Date filter");

    private void NewProject_Click(object sender, RoutedEventArgs e)
    {
        var dialog = new NewProjectWindow { Owner = this };
        if (dialog.ShowDialog() == true)
        {
            projects.Add(new Project
            {
                Name = dialog.ProjectName,
                Customer = dialog.Customer,
                Location = dialog.Location,
                EstimatedBudget = dialog.Budget,
                ActualCost = 0,
                ProgressPercent = 0,
                Status = "Planning"
            });
            RenderProjects();
            ShowStatus($"Project '{dialog.ProjectName}' created successfully.");
            MessageBox.Show($"Project '{dialog.ProjectName}' was created with an estimated budget of {dialog.Budget:C}.", "Project created", MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }

    private void ShowWorkspace(string module)
    {
        ShowStatus($"{module} opened.");
        new WorkspaceWindow(module) { Owner = this }.ShowDialog();
    }

    private void ShowProjectsWindow()
    {
        ShowStatus("Projects opened.");
        var projectsWindow = new ProjectsWindow(projects) { Owner = this };
        projectsWindow.ShowDialog();
    }

    private void ShowStatus(string message)
    {
        StatusText.Text = message;
    }

    private void RenderProjects()
    {
        ProjectListPanel.Children.Clear();
        foreach (var project in projects)
        {
            ProjectListPanel.Children.Add(CreateProjectRow(project));
        }

        ActiveProjectsText.Text = projects.Count.ToString("00");
        var committed = projects.Sum(project => project.ActualCost);
        var budget = projects.Sum(project => project.EstimatedBudget);
        BudgetCommittedText.Text = committed >= 1_000_000 ? $"${committed / 1_000_000:0.00}M" : $"${committed / 1_000:0}K";
        TotalBudgetText.Text = $"of {budget:C1} total budget";
    }

    private static Border CreateProjectRow(Project project)
    {
        var statusBrush = project.Status == "Needs review" ? new SolidColorBrush(Color.FromRgb(199, 120, 60)) : new SolidColorBrush(Color.FromRgb(45, 118, 91));
        var progress = new ProgressBar { Value = project.ProgressPercent, Height = 5, Margin = new Thickness(0, 7, 15, 0), Foreground = statusBrush, Background = new SolidColorBrush(Color.FromRgb(234, 240, 235)), BorderThickness = new Thickness(0) };
        var progressHeader = new DockPanel();
        progressHeader.Children.Add(new TextBlock { Text = "Overall progress", Foreground = new SolidColorBrush(Color.FromRgb(113, 128, 122)), FontSize = 9 });
        var progressValue = new TextBlock { Text = $"{project.ProgressPercent}%", FontSize = 9, FontWeight = FontWeights.Bold };
        DockPanel.SetDock(progressValue, Dock.Right);
        progressHeader.Children.Add(progressValue);

        var grid = new Grid { Margin = new Thickness(20, 17, 20, 17) };
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(42) });
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1.5, GridUnitType.Star) });
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1.1, GridUnitType.Star) });
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(110) });
        grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
        var icon = new Border { Width = 36, Height = 36, Background = new SolidColorBrush(Color.FromRgb(219, 233, 223)), CornerRadius = new CornerRadius(5), Child = new TextBlock { Text = project.Name[..1].ToUpperInvariant(), Foreground = new SolidColorBrush(Color.FromRgb(45, 118, 91)), FontWeight = FontWeights.Bold, HorizontalAlignment = HorizontalAlignment.Center, VerticalAlignment = VerticalAlignment.Center } };
        grid.Children.Add(icon);
        var title = new StackPanel { VerticalAlignment = VerticalAlignment.Center };
        title.Children.Add(new TextBlock { Text = project.Name, FontWeight = FontWeights.SemiBold, FontSize = 12 });
        title.Children.Add(new TextBlock { Text = string.IsNullOrWhiteSpace(project.Location) ? "Location pending" : project.Location, Foreground = new SolidColorBrush(Color.FromRgb(113, 128, 122)), FontSize = 10, Margin = new Thickness(0, 5, 0, 0) });
        Grid.SetColumn(title, 1);
        grid.Children.Add(title);
        var progressPanel = new StackPanel { VerticalAlignment = VerticalAlignment.Center };
        progressPanel.Children.Add(progressHeader);
        progressPanel.Children.Add(progress);
        Grid.SetColumn(progressPanel, 2);
        grid.Children.Add(progressPanel);
        var status = new TextBlock { Text = $"●  {project.Status}", Foreground = statusBrush, FontSize = 10, VerticalAlignment = VerticalAlignment.Center, Margin = new Thickness(18, 0, 0, 0) };
        Grid.SetColumn(status, 3);
        grid.Children.Add(status);
        var next = new StackPanel { VerticalAlignment = VerticalAlignment.Center };
        next.Children.Add(new TextBlock { Text = "NEXT UP", Foreground = new SolidColorBrush(Color.FromRgb(154, 165, 159)), FontSize = 8, FontWeight = FontWeights.Bold });
        next.Children.Add(new TextBlock { Text = project.ProgressPercent == 0 ? "Set project schedule" : "Review project details", FontSize = 10, Margin = new Thickness(0, 5, 0, 0) });
        Grid.SetColumn(next, 4);
        grid.Children.Add(next);
        return new Border { Background = Brushes.White, BorderBrush = new SolidColorBrush(Color.FromRgb(226, 232, 226)), BorderThickness = new Thickness(1, 0, 1, 1), Child = grid };
    }
}