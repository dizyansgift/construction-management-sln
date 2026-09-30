using ConstructionManagement.Application.Projects;
using ConstructionManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using ConstructionManagement.Infrastructure.Persistence;

namespace ConstructionManagement.Infrastructure.Projects;

public sealed class ProjectService(ConstructionDbContext dbContext) : IProjectService
{
    public async Task<IReadOnlyList<ProjectListItem>> GetAsync(CancellationToken cancellationToken = default)
    {
        var projects = await ActiveProjects()
            .OrderBy(project => project.Name)
            .ToListAsync(cancellationToken);
        return projects.Select(ToListItem).ToList();
    }

    public async Task<ProjectListItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var project = await ActiveProjects()
            .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        return project is null ? null : ToListItem(project);
    }

    public async Task<ProjectListItem> CreateAsync(CreateProjectRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) throw new ArgumentException("Project name is required.");
        var startDate = DateTimeUtc.From(request.StartDate ?? DateTime.UtcNow);
        var expectedCompletion = DateTimeUtc.From(request.ExpectedCompletionDate ?? startDate.AddMonths(6));
        if (expectedCompletion < startDate) throw new ArgumentException("Expected completion cannot be before the start date.");
        if (request.EstimatedBudget < 0) throw new ArgumentException("Estimated budget cannot be negative.");
        if (await dbContext.Projects.AnyAsync(project => project.ProjectCode == request.ProjectCode, cancellationToken)) throw new InvalidOperationException("Project code already exists.");

        var client = await dbContext.Clients.SingleOrDefaultAsync(item => item.Name == request.ClientName, cancellationToken);
        if (client is null)
        {
            client = new Client { Name = request.ClientName, Contact = request.ClientContact };
            dbContext.Clients.Add(client);
        }

        var project = new Project
        {
            ProjectCode = request.ProjectCode,
            Name = request.Name,
            Client = client,
            SiteAddress = request.SiteAddress,
            StartDate = startDate,
            ExpectedCompletionDate = expectedCompletion,
            EstimatedBudget = request.EstimatedBudget,
            ProjectManager = request.ProjectManager,
            Description = request.Description,
            FoundationSystem = request.FoundationSystem ?? string.Empty
        };
        dbContext.Projects.Add(project);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToListItem(project);
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateProjectRequest request, CancellationToken cancellationToken = default)
    {
        var project = await dbContext.Projects.SingleOrDefaultAsync(item => item.Id == id && !item.IsArchived, cancellationToken);
        if (project is null) return false;
        project.Name = request.Name;
        project.SiteAddress = request.SiteAddress;
        project.ExpectedCompletionDate = DateTimeUtc.From(request.ExpectedCompletionDate);
        project.EstimatedBudget = request.EstimatedBudget;
        project.Status = request.Status;
        project.ProgressPercent = request.ProgressPercent;
        project.ProjectManager = request.ProjectManager;
        project.Description = request.Description;
        project.UpdatedUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> UpdateConstructionPlanAsync(Guid id, UpdateConstructionPlanRequest request, CancellationToken cancellationToken = default)
    {
        var project = await dbContext.Projects.SingleOrDefaultAsync(item => item.Id == id && !item.IsArchived, cancellationToken);
        if (project is null) return false;
        project.FoundationSystem = request.FoundationSystem ?? string.Empty;
        project.ConstructionPlanJson = request.ConstructionPlanJson;
        project.ProgressPercent = request.ProgressPercent;
        project.ActualCost = request.ActualCost;
        project.UpdatedUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<ProjectListItem?> GetConstructionPlanAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> ArchiveAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var project = await dbContext.Projects.SingleOrDefaultAsync(item => item.Id == id && !item.IsArchived, cancellationToken);
        if (project is null) return false;
        project.IsArchived = true;
        project.UpdatedUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private IQueryable<Project> ActiveProjects() =>
        dbContext.Projects.AsNoTracking()
            .Include(project => project.Client)
            .Where(project => !project.IsArchived);

    private static ProjectListItem ToListItem(Project project) => new(
        project.Id,
        project.ProjectCode,
        project.Name,
        project.Client?.Name ?? string.Empty,
        project.SiteAddress,
        project.EstimatedBudget,
        project.ActualCost,
        project.ProgressPercent,
        project.Status,
        project.FoundationSystem ?? string.Empty,
        project.ConstructionPlanJson);
}
