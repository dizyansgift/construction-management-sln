using ConstructionManagement.Application.Projects;
using ConstructionManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using ConstructionManagement.Infrastructure.Persistence;

namespace ConstructionManagement.Infrastructure.Projects;

public sealed class ProjectService(ConstructionDbContext dbContext) : IProjectService
{
    public async Task<IReadOnlyList<ProjectListItem>> GetAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Projects.AsNoTracking().Where(project => !project.IsArchived).OrderBy(project => project.Name).Select(project => ToListItem(project)).ToListAsync(cancellationToken);
    }

    public async Task<ProjectListItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Projects.AsNoTracking().Where(project => project.Id == id && !project.IsArchived).Select(project => ToListItem(project)).SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<ProjectListItem> CreateAsync(CreateProjectRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) throw new ArgumentException("Project name is required.");
        if (request.ExpectedCompletionDate < request.StartDate) throw new ArgumentException("Expected completion cannot be before the start date.");
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
            StartDate = request.StartDate,
            ExpectedCompletionDate = request.ExpectedCompletionDate,
            EstimatedBudget = request.EstimatedBudget,
            ProjectManager = request.ProjectManager,
            Description = request.Description
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
        project.ExpectedCompletionDate = request.ExpectedCompletionDate;
        project.EstimatedBudget = request.EstimatedBudget;
        project.Status = request.Status;
        project.ProgressPercent = request.ProgressPercent;
        project.ProjectManager = request.ProjectManager;
        project.Description = request.Description;
        project.UpdatedUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
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

    private static ProjectListItem ToListItem(Project project) => new(project.Id, project.ProjectCode, project.Name, project.Client?.Name ?? string.Empty, project.SiteAddress, project.EstimatedBudget, project.ActualCost, project.ProgressPercent, project.Status);
}
