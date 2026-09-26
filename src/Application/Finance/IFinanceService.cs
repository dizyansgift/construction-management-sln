namespace ConstructionManagement.Application.Finance;

public interface IFinanceService
{
    Task<IReadOnlyList<ExpenseListItem>> GetExpensesAsync(CancellationToken cancellationToken = default);
    Task<ExpenseListItem> CreateExpenseAsync(CreateExpenseRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PaymentListItem>> GetPaymentsAsync(CancellationToken cancellationToken = default);
    Task<PaymentListItem> CreatePaymentAsync(CreatePaymentRequest request, CancellationToken cancellationToken = default);
}
