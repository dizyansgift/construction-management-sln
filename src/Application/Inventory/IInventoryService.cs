namespace ConstructionManagement.Application.Inventory;

public interface IInventoryService
{
    Task<IReadOnlyList<MaterialListItem>> GetMaterialsAsync(CancellationToken cancellationToken = default);
    Task<MaterialListItem> ReceiveMaterialAsync(ReceiveMaterialRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BoqListItem>> GetBoqItemsAsync(CancellationToken cancellationToken = default);
    Task<BoqListItem> CreateBoqItemAsync(CreateBoqItemRequest request, CancellationToken cancellationToken = default);
}
