using System.Net.Http.Json;
using ConstructionManagement.Maui.Models;

namespace ConstructionManagement.Maui.Services;

public sealed class ProjectApiService(HttpClient httpClient)
{
    public async Task<IReadOnlyList<ProjectModel>> GetProjectsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await httpClient.GetFromJsonAsync<List<ProjectModel>>("api/projects", cancellationToken) ?? [];
        }
        catch (HttpRequestException)
        {
            return [];
        }
    }
}
