using ConstructionManagement.Application.Projects;
using Microsoft.AspNetCore.Mvc;

namespace ConstructionManagement.Api.Controllers;

[ApiController]
[Route("api/projects")]
public sealed class ProjectsController(IProjectService projectService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProjectListItem>>> Get(CancellationToken cancellationToken) => Ok(await projectService.GetAsync(cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProjectListItem>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var project = await projectService.GetByIdAsync(id, cancellationToken);
        return project is null ? NotFound() : Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectListItem>> Create(CancellationToken cancellationToken)
    {
        string body;
        using (var reader = new StreamReader(Request.Body))
        {
            body = await reader.ReadToEndAsync();
        }

        if (string.IsNullOrWhiteSpace(body))
        {
            return BadRequest(new { message = "Request body is required." });
        }

        // Normalize empty date strings to null to avoid JsonSerializer failing on empty strings
        body = body.Replace("\"startDate\":\"\"", "\"startDate\":null", StringComparison.OrdinalIgnoreCase);
        body = body.Replace("\"expectedCompletionDate\":\"\"", "\"expectedCompletionDate\":null", StringComparison.OrdinalIgnoreCase);

        CreateProjectRequest? request;
        try
        {
            var opts = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            request = System.Text.Json.JsonSerializer.Deserialize<CreateProjectRequest>(body, opts);
        }
        catch (System.Text.Json.JsonException ex)
        {
            return BadRequest(new { message = "Invalid JSON payload.", detail = ex.Message });
        }

        if (request is null)
        {
            return BadRequest(new { message = "Request could not be deserialized into CreateProjectRequest." });
        }

        try
        {
            var project = await projectService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
        catch (Exception ex)
        {
            // Return server error with message to aid debugging (do not expose in production)
            return StatusCode(500, new { message = "Server error while creating project.", detail = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateProjectRequest request, CancellationToken cancellationToken) => await projectService.UpdateAsync(id, request, cancellationToken) ? NoContent() : NotFound();

    [HttpPut("{id:guid}/construction-plan")]
    [HttpPost("{id:guid}/construction-plan")]
    [RequestSizeLimit(20_000_000)]
    public async Task<IActionResult> UpdateConstructionPlan(Guid id, [FromBody] UpdateConstructionPlanRequest request, CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return BadRequest(new { message = "Request body is required." });
        }

        try
        {
            var updated = await projectService.UpdateConstructionPlanAsync(id, request, cancellationToken);
            return updated ? NoContent() : NotFound(new { message = "Project not found." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Could not save construction plan.", detail = ex.Message });
        }
    }

    [HttpGet("{id:guid}/construction-plan")]
    public async Task<ActionResult<ProjectListItem>> GetConstructionPlan(Guid id, CancellationToken cancellationToken)
    {
        var project = await projectService.GetConstructionPlanAsync(id, cancellationToken);
        return project is null ? NotFound() : Ok(project);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken cancellationToken) => await projectService.ArchiveAsync(id, cancellationToken) ? NoContent() : NotFound();
}
