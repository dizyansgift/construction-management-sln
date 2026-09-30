using ConstructionManagement.Application.Labour;
using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Labour;

public sealed class LabourService(ConstructionDbContext dbContext) : ILabourService
{
    public async Task<IReadOnlyList<LabourAttendanceListItem>> GetAttendanceAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.LabourAttendance.AsNoTracking().OrderByDescending(record => record.Date)
            .Select(record => ToListItem(record)).ToListAsync(cancellationToken);
    }

    public async Task<LabourAttendanceListItem> RecordAttendanceAsync(RecordAttendanceRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.WorkerName)) throw new ArgumentException("Worker name is required.");
        if (request.DailyWage < 0) throw new ArgumentException("Daily wage cannot be negative.");

        var record = new LabourAttendance
        {
            ProjectId = request.ProjectId,
            WorkerName = request.WorkerName,
            Role = request.Role,
            Date = DateTimeUtc.From(request.Date),
            DailyWage = request.DailyWage,
            OvertimeHours = request.OvertimeHours,
            Status = request.Status,
        };
        dbContext.LabourAttendance.Add(record);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToListItem(record);
    }

    private static LabourAttendanceListItem ToListItem(LabourAttendance record) => new(
        record.Id, record.ProjectId, record.WorkerName, record.Role, record.Date, record.DailyWage, record.OvertimeHours, record.Status);
}
