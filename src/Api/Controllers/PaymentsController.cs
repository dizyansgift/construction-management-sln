using ConstructionManagement.Application.Finance;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.Api.Controllers;

[ApiController]
[Route("api/payments")]
public sealed class PaymentsController(IFinanceService financeService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PaymentListItem>>> Get(CancellationToken cancellationToken) => Ok(await financeService.GetPaymentsAsync(cancellationToken));

    [HttpPost]
    public async Task<ActionResult<PaymentListItem>> Create(CreatePaymentRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await financeService.CreatePaymentAsync(request, cancellationToken));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }
}
