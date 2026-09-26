using ConstructionManagement.Application.Finance;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.Api.Controllers;

[ApiController]
[Route("api/expenses")]
public sealed class ExpensesController(IFinanceService financeService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ExpenseListItem>>> Get(CancellationToken cancellationToken) => Ok(await financeService.GetExpensesAsync(cancellationToken));

    [HttpPost]
    public async Task<ActionResult<ExpenseListItem>> Create(CreateExpenseRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await financeService.CreateExpenseAsync(request, cancellationToken));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }
}
