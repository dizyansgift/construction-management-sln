using System.Windows;

namespace ConstructionManagement;

public partial class NewProjectWindow : Window
{
    public NewProjectWindow()
    {
        InitializeComponent();
    }

    public string ProjectName => ProjectNameTextBox.Text.Trim();
    public string Customer => CustomerTextBox.Text.Trim();
    public string Location => LocationTextBox.Text.Trim();
    public decimal Budget { get; private set; }

    private void Create_Click(object sender, RoutedEventArgs e)
    {
        ValidationText.Text = string.Empty;

        if (string.IsNullOrWhiteSpace(ProjectName))
        {
            ValidationText.Text = "Project name is required.";
            ProjectNameTextBox.Focus();
            return;
        }

        if (!decimal.TryParse(BudgetTextBox.Text.Trim(), out var budget) || budget < 0)
        {
            ValidationText.Text = "Enter a valid estimated budget, for example 250000.";
            BudgetTextBox.Focus();
            return;
        }

        Budget = budget;
        DialogResult = true;
    }

    private void Cancel_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = false;
    }
}
