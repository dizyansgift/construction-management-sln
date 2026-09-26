using ConstructionManagement.Application.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.Api.Controllers;

[ApiController]
[Route("api/materials")]
public sealed class MaterialsController(IInventoryService inventoryService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MaterialListItem>>> Get(CancellationToken cancellationToken) => Ok(await inventoryService.GetMaterialsAsync(cancellationToken));

    [HttpPost]
    public async Task<ActionResult<MaterialListItem>> Receive(ReceiveMaterialRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await inventoryService.ReceiveMaterialAsync(request, cancellationToken));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }
}
