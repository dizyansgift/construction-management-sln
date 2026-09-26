using ConstructionManagement.Application.Inventory;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Inventory;

public sealed class InventoryService(ConstructionDbContext dbContext) : IInventoryService
{
    public async Task<IReadOnlyList<MaterialListItem>> GetMaterialsAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Materials.AsNoTracking().OrderBy(material => material.Name)
            .Select(material => ToListItem(material)).ToListAsync(cancellationToken);
    }

    public async Task<MaterialListItem> ReceiveMaterialAsync(ReceiveMaterialRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) throw new ArgumentException("Material name is required.");
        if (request.Quantity <= 0) throw new ArgumentException("Received quantity must be greater than zero.");

        var existing = await dbContext.Materials.SingleOrDefaultAsync(
            material => material.ProjectId == request.ProjectId && material.Name.ToLower() == request.Name.ToLower(),
            cancellationToken);

        if (existing is not null)
        {
            existing.CurrentStock += request.Quantity;
            existing.MinimumStock = request.MinimumStock;
            existing.UnitPrice = request.UnitPrice;
            existing.SupplierName = request.SupplierName;
            existing.UpdatedUtc = DateTime.UtcNow;
            await dbContext.SaveChangesAsync(cancellationToken);
            return ToListItem(existing);
        }

        var material = new Material
        {
            ProjectId = request.ProjectId,
            Name = request.Name,
            Category = request.Category,
            Unit = request.Unit,
            CurrentStock = request.Quantity,
            MinimumStock = request.MinimumStock,
            UnitPrice = request.UnitPrice,
            SupplierName = request.SupplierName,
        };
        dbContext.Materials.Add(material);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToListItem(material);
    }

    public async Task<IReadOnlyList<BoqListItem>> GetBoqItemsAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.BoqItems.AsNoTracking().OrderByDescending(item => item.CreatedUtc)
            .Select(item => ToListItem(item)).ToListAsync(cancellationToken);
    }

    public async Task<BoqListItem> CreateBoqItemAsync(CreateBoqItemRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Description)) throw new ArgumentException("BOQ description is required.");
        if (request.Quantity <= 0) throw new ArgumentException("Quantity must be greater than zero.");

        var item = new BoqItem
        {
            ProjectId = request.ProjectId,
            Category = request.Category,
            Description = request.Description,
            Unit = request.Unit,
            Quantity = request.Quantity,
            EstimatedRate = request.EstimatedRate,
        };
        dbContext.BoqItems.Add(item);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToListItem(item);
    }

    private static MaterialListItem ToListItem(Material material) => new(
        material.Id, material.ProjectId, material.Name, material.Category, material.Unit,
        material.CurrentStock, material.MinimumStock, material.UnitPrice, material.SupplierName);

    private static BoqListItem ToListItem(BoqItem item) => new(
        item.Id, item.ProjectId, item.Category, item.Description, item.Unit, item.Quantity, item.EstimatedRate, item.ActualRate);
}
