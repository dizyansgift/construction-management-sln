using ConstructionManagement.Application.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.Api.Controllers;

[ApiController]
[Route("api/boq-items")]
public sealed class BoqItemsController(IInventoryService inventoryService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BoqListItem>>> Get(CancellationToken cancellationToken) => Ok(await inventoryService.GetBoqItemsAsync(cancellationToken));

    [HttpPost]
    public async Task<ActionResult<BoqListItem>> Create(CreateBoqItemRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await inventoryService.CreateBoqItemAsync(request, cancellationToken));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }
}
