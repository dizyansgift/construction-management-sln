using System.Collections.Generic;
using System.Windows;
using ConstructionManagement.Models;

namespace ConstructionManagement;

public partial class ProjectsWindow : Window
{
    public ProjectsWindow(IEnumerable<Project> projects)
    {
        InitializeComponent();
        var projectList = projects.ToList();
        ProjectsList.ItemsSource = projectList;
        ProjectCountText.Text = $"{projectList.Count} active project{(projectList.Count == 1 ? string.Empty : "s")}";
    }

    private void Close_Click(object sender, RoutedEventArgs e)
    {
        Close();
    }
}
