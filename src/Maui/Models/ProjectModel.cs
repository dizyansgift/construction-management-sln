namespace ConstructionManagement.Maui.Models;

public sealed record ProjectModel(
    Guid Id,
    string ProjectCode,
    string Name,
    string ClientName,
    string SiteAddress,
    decimal EstimatedBudget,
    decimal ActualCost,
    decimal ProgressPercent,
    string Status);
