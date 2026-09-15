using ConstructionManagement.Domain.Common;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

public sealed class Project : Entity
{
    public string ProjectCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid ClientId { get; set; }
    public Client? Client { get; set; }
    public string SiteAddress { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime ExpectedCompletionDate { get; set; }
    public DateTime? ActualCompletionDate { get; set; }
    public decimal EstimatedBudget { get; set; }
    public decimal ActualCost { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;
    public decimal ProgressPercent { get; set; }
    public string ProjectManager { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsArchived { get; set; }
    public ICollection<BoqItem> BoqItems { get; set; } = [];
    public ICollection<Expense> Expenses { get; set; } = [];
    public ICollection<ProgressUpdate> ProgressUpdates { get; set; } = [];
    public ICollection<SitePhoto> SitePhotos { get; set; } = [];
}
