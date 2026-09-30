namespace ConstructionManagement.Infrastructure.Persistence;

internal static class DateTimeUtc
{
    public static DateTime From(DateTime value)
    {
        if (value.Kind == DateTimeKind.Utc) return value;
        if (value.Kind == DateTimeKind.Local) return value.ToUniversalTime();
        return DateTime.SpecifyKind(value, DateTimeKind.Utc);
    }

    public static DateTime? From(DateTime? value) => value is null ? null : From(value.Value);
}
