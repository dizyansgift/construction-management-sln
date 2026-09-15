using ConstructionManagement.Domain.Common;

namespace ConstructionManagement.Domain.Entities;

public sealed class Client : Entity
{
    public string Name { get; set; } = string.Empty;
    public string Contact { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public ICollection<Project> Projects { get; set; } = [];
}
