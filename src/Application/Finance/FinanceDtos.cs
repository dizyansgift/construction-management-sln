namespace ConstructionManagement.Application.Finance;

public sealed record ExpenseListItem(
    Guid Id,
    Guid ProjectId,
    string? PhaseId,
    string Category,
    decimal Amount,
    DateTime Date,
    string Vendor,
    string Description,
    string PaymentMethod);

public sealed record CreateExpenseRequest(
    Guid ProjectId,
    string? PhaseId,
    string Category,
    decimal Amount,
    DateTime Date,
    string Vendor,
    string Description,
    string PaymentMethod);

public sealed record PaymentListItem(
    Guid Id,
    Guid ProjectId,
    string? PhaseId,
    string PaymentType,
    string PartyName,
    string InvoiceNumber,
    decimal Amount,
    DateTime Date,
    DateTime? DueDate,
    string Status);

public sealed record CreatePaymentRequest(
    Guid ProjectId,
    string? PhaseId,
    string PaymentType,
    string PartyName,
    string InvoiceNumber,
    decimal Amount,
    DateTime? DueDate,
    string Status);
