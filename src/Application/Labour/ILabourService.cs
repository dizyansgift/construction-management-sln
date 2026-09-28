namespace ConstructionManagement.Application.Labour;

public interface ILabourService
{
    Task<IReadOnlyList<LabourAttendanceListItem>> GetAttendanceAsync(CancellationToken cancellationToken = default);
    Task<LabourAttendanceListItem> RecordAttendanceAsync(RecordAttendanceRequest request, CancellationToken cancellationToken = default);
}
