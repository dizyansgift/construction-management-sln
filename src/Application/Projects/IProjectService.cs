namespace ConstructionManagement.Application.Projects;

public interface IProjectService
{
    Task<IReadOnlyList<ProjectListItem>> GetAsync(CancellationToken cancellationToken = default);
    Task<ProjectListItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProjectListItem> CreateAsync(CreateProjectRequest request, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(Guid id, UpdateProjectRequest request, CancellationToken cancellationToken = default);
    Task<bool> UpdateConstructionPlanAsync(Guid id, UpdateConstructionPlanRequest request, CancellationToken cancellationToken = default);
    Task<bool> ArchiveAsync(Guid id, CancellationToken cancellationToken = default);
}
