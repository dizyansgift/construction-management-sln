namespace ConstructionManagement.Application.Inventory;

public sealed record MaterialListItem(
    Guid Id,
    Guid ProjectId,
    string Name,
    string Category,
    string Unit,
    decimal CurrentStock,
    decimal MinimumStock,
    decimal UnitPrice,
    string SupplierName);

public sealed record ReceiveMaterialRequest(
    Guid ProjectId,
    string Name,
    string Category,
    string Unit,
    decimal Quantity,
    decimal MinimumStock,
    decimal UnitPrice,
    string SupplierName);

public sealed record BoqListItem(
    Guid Id,
    Guid ProjectId,
    string Category,
    string Description,
    string Unit,
    decimal Quantity,
    decimal EstimatedRate,
    decimal ActualRate);

public sealed record CreateBoqItemRequest(
    Guid ProjectId,
    string Category,
    string Description,
    string Unit,
    decimal Quantity,
    decimal EstimatedRate);
