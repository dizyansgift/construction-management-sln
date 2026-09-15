using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace ConstructionManagement;

public partial class WorkspaceWindow : Window
{
    private static readonly Dictionary<string, (string Subtitle, string[] Items)> WorkspaceData = new()
    {
        ["Schedule"] = ("Upcoming site activity across your active projects.", ["08:00   Safety walk                         Riverside Medical Pavilion", "10:30   Subcontractor sync             Northline Apartments", "13:00   Materials delivery               Cedar Street Retail", "15:30   Owner update                       Riverside Medical Pavilion"]),
        ["Documents"] = ("Project drawings, permits, contracts, and site records.", ["Riverside Medical Pavilion     Construction drawings     Updated today", "Northline Apartments                 Permit package                Updated yesterday", "Cedar Street Retail                    Subcontract agreement       Updated Sep 08", "Shared                                    Safety templates              Updated Sep 05"]),
        ["Team"] = ("People and contractors connected to your active projects.", ["Jordan Miles                         Project director", "Maya Singh                           Site engineer · Riverside Medical Pavilion", "Alex Kim                               Procurement · Cedar Street Retail", "Northline Civil                    Subcontractor · Northline Apartments"]),
        ["Settings"] = ("Workspace preferences and company configuration.", ["Company profile                         West Coast Build Co.", "Currency                                  USD ($)", "Project numbering                     Automatic", "Notifications                           Enabled"]),
        ["Search"] = ("Search is ready across projects, people, documents, and materials.", ["Try searching for a project name, customer, location, or document."]),
        ["Notifications"] = ("Recent activity and items requiring attention.", ["No new notifications", "You are up to date across all active projects."]),
        ["Date filter"] = ("This week is selected. Activity is shown for September 11-17, 2026.", ["Monday, Sep 11                         4 scheduled activities", "Tuesday, Sep 12                         Permit review · Northline Apartments", "Thursday, Sep 14                       Concrete pour · Riverside Medical Pavilion", "Sunday, Sep 17                          Weekly project review"])
    };

    public WorkspaceWindow(string module)
    {
        InitializeComponent();
        Title = $"{module} | Fieldline";
        EyebrowText.Text = "FIELDLINE WORKSPACE";
        TitleText.Text = module;
        var data = WorkspaceData.TryGetValue(module, out var workspace) ? workspace : ("Workspace information.", ["No records available yet."]);
        SubtitleText.Text = data.Subtitle;
        foreach (var item in data.Items)
        {
            ItemsList.Items.Add(new ListBoxItem
            {
                Content = item,
                Padding = new Thickness(12),
                BorderBrush = new SolidColorBrush(Color.FromRgb(226, 232, 226)),
                BorderThickness = new Thickness(0, 0, 0, 1)
            });
        }
    }

    private void Close_Click(object sender, RoutedEventArgs e) => Close();
}
