using ConstructionManagement.Domain.Common;
using ConstructionManagement.Domain.Enums;

namespace ConstructionManagement.Domain.Entities;

public sealed class BoqItem : Entity
{
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal EstimatedRate { get; set; }
    public decimal ActualRate { get; set; }
    public decimal EstimatedAmount => Quantity * EstimatedRate;
    public decimal ActualAmount => Quantity * ActualRate;
}

public sealed class Material : Entity
{
    public Guid ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal CurrentStock { get; set; }
    public decimal MinimumStock { get; set; }
    public decimal UnitPrice { get; set; }
    public string SupplierName { get; set; } = string.Empty;
}

public sealed class LabourAttendance : Entity
{
    public Guid ProjectId { get; set; }
    public string WorkerName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal DailyWage { get; set; }
    public decimal OvertimeHours { get; set; }
    public bool Present { get; set; }
}

public sealed class Expense : Entity
{
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }
    public string? PhaseId { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Vendor { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? ReceiptUrl { get; set; }
}

public sealed class Payment : Entity
{
    public Guid ProjectId { get; set; }
    public string? PhaseId { get; set; }
    public string PaymentType { get; set; } = string.Empty;
    public string PartyName { get; set; } = string.Empty;
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public DateTime? DueDate { get; set; }
    public string Status { get; set; } = "Pending";
}

public sealed class ProgressUpdate : Entity
{
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }
    public ConstructionStage Stage { get; set; }
    public decimal Percentage { get; set; }
    public string Notes { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}

public sealed class SitePhoto : Entity
{
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }
    public ConstructionStage Stage { get; set; }
    public string StorageKey { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CapturedUtc { get; set; }
    public string UploadedBy { get; set; } = string.Empty;
}
