namespace ConstructionManagement.Models;

public sealed class Project
{
    public string Name { get; init; } = string.Empty;
    public string Customer { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;
    public decimal EstimatedBudget { get; init; }
    public decimal ActualCost { get; init; }
    public int ProgressPercent { get; init; }
    public string Status { get; init; } = "Planning";
}
