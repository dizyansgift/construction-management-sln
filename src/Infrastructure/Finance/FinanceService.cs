using ConstructionManagement.Application.Finance;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Finance;

public sealed class FinanceService(ConstructionDbContext dbContext) : IFinanceService
{
    public async Task<IReadOnlyList<ExpenseListItem>> GetExpensesAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Expenses.AsNoTracking().OrderByDescending(expense => expense.Date)
            .Select(expense => ToListItem(expense)).ToListAsync(cancellationToken);
    }

    public async Task<ExpenseListItem> CreateExpenseAsync(CreateExpenseRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Description)) throw new ArgumentException("Expense description is required.");
        if (request.Amount <= 0) throw new ArgumentException("Expense amount must be greater than zero.");

        var expense = new Expense
        {
            ProjectId = request.ProjectId,
            PhaseId = request.PhaseId,
            Category = request.Category,
            Amount = request.Amount,
            Date = request.Date,
            Vendor = request.Vendor,
            Description = request.Description,
            PaymentMethod = request.PaymentMethod,
        };
        dbContext.Expenses.Add(expense);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToListItem(expense);
    }

    public async Task<IReadOnlyList<PaymentListItem>> GetPaymentsAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Payments.AsNoTracking().OrderByDescending(payment => payment.Date)
            .Select(payment => ToListItem(payment)).ToListAsync(cancellationToken);
    }

    public async Task<PaymentListItem> CreatePaymentAsync(CreatePaymentRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.InvoiceNumber)) throw new ArgumentException("Invoice or reference is required.");
        if (request.Amount <= 0) throw new ArgumentException("Payment amount must be greater than zero.");
        if (await dbContext.Payments.AnyAsync(payment => payment.InvoiceNumber == request.InvoiceNumber, cancellationToken))
            throw new InvalidOperationException("An invoice or reference with this number already exists.");

        var payment = new Payment
        {
            ProjectId = request.ProjectId,
            PhaseId = request.PhaseId,
            PaymentType = request.PaymentType,
            PartyName = request.PartyName,
            InvoiceNumber = request.InvoiceNumber,
            Amount = request.Amount,
            Date = DateTime.UtcNow,
            DueDate = request.DueDate,
            Status = request.Status,
        };
        dbContext.Payments.Add(payment);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToListItem(payment);
    }

    private static ExpenseListItem ToListItem(Expense expense) => new(
        expense.Id, expense.ProjectId, expense.PhaseId, expense.Category, expense.Amount,
        expense.Date, expense.Vendor, expense.Description, expense.PaymentMethod);

    private static PaymentListItem ToListItem(Payment payment) => new(
        payment.Id, payment.ProjectId, payment.PhaseId, payment.PaymentType, payment.PartyName,
        payment.InvoiceNumber, payment.Amount, payment.Date, payment.DueDate, payment.Status);
}
