using ConstructionManagement.Application.Labour;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.Api.Controllers;

[ApiController]
[Route("api/labour")]
public sealed class LabourController(ILabourService labourService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<LabourAttendanceListItem>>> Get(CancellationToken cancellationToken) => Ok(await labourService.GetAttendanceAsync(cancellationToken));

    [HttpPost]
    public async Task<ActionResult<LabourAttendanceListItem>> Record(RecordAttendanceRequest request, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await labourService.RecordAttendanceAsync(request, cancellationToken));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }
}
