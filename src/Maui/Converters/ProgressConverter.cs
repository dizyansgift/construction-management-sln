using System.Globalization;

namespace ConstructionManagement.Maui.Converters;

public sealed class ProgressConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        return value is decimal progress ? (double)(progress / 100m) : 0d;
    }

    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture) => throw new NotSupportedException();
}
