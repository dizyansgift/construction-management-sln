namespace ConstructionManagement.Application.Labour;

public sealed record LabourAttendanceListItem(
    Guid Id,
    Guid ProjectId,
    string WorkerName,
    string Role,
    DateTime Date,
    decimal DailyWage,
    decimal OvertimeHours,
    string Status);

public sealed record RecordAttendanceRequest(
    Guid ProjectId,
    string WorkerName,
    string Role,
    DateTime Date,
    decimal DailyWage,
    decimal OvertimeHours,
    string Status);
