using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Application.Projects;

public sealed record ProjectListItem(
    Guid Id,
    string ProjectCode,
    string Name,
    string ClientName,
    string SiteAddress,
    decimal EstimatedBudget,
    decimal ActualCost,
    decimal ProgressPercent,
    ProjectStatus Status);

public sealed record CreateProjectRequest(
    string ProjectCode,
    string Name,
    string ClientName,
    string ClientContact,
    string SiteAddress,
    DateTime StartDate,
    DateTime ExpectedCompletionDate,
    decimal EstimatedBudget,
    string ProjectManager,
    string Description);

public sealed record UpdateProjectRequest(
    string Name,
    string SiteAddress,
    DateTime ExpectedCompletionDate,
    decimal EstimatedBudget,
    ProjectStatus Status,
    decimal ProgressPercent,
    string ProjectManager,
    string Description);
