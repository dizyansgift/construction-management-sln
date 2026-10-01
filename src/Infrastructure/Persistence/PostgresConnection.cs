using Npgsql;

namespace ConstructionManagement.Infrastructure.Persistence;

public static class PostgresConnection
{
    public static string? Resolve(params string?[] candidates)
    {
        foreach (var raw in candidates)
        {
            if (string.IsNullOrWhiteSpace(raw)) continue;
            try
            {
                return Normalize(raw);
            }
            catch
            {
                // try the next candidate
            }
        }

        return null;
    }

    public static bool LooksLikePostgres(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return false;
        var trimmed = value.Trim().Trim('"', '\'');
        return trimmed.StartsWith("postgres", StringComparison.OrdinalIgnoreCase)
            || trimmed.Contains("Host=", StringComparison.OrdinalIgnoreCase)
            || trimmed.Contains("Username=", StringComparison.OrdinalIgnoreCase);
    }

    public static string Normalize(string raw)
    {
        var value = raw.Trim().Trim('"', '\'');
        if (value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
            value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
        {
            var uri = new Uri(value.Replace("postgresql://", "postgres://", StringComparison.OrdinalIgnoreCase));
            var user = string.Empty;
            var password = string.Empty;
            if (!string.IsNullOrEmpty(uri.UserInfo))
            {
                var parts = uri.UserInfo.Split(':', 2);
                user = Uri.UnescapeDataString(parts[0]);
                if (parts.Length > 1) password = Uri.UnescapeDataString(parts[1]);
            }

            var builder = new NpgsqlConnectionStringBuilder
            {
                Host = uri.Host,
                Port = uri.IsDefaultPort ? 5432 : uri.Port,
                Database = uri.AbsolutePath.Trim('/'),
                Username = user,
                Password = password,
                SslMode = SslMode.Require,
                TrustServerCertificate = true,
            };
            return builder.ConnectionString;
        }

        return new NpgsqlConnectionStringBuilder(value)
        {
            SslMode = SslMode.Require,
            TrustServerCertificate = true,
        }.ConnectionString;
    }

    public static string? Host(string? connection)
    {
        if (string.IsNullOrWhiteSpace(connection)) return null;
        try
        {
            return new NpgsqlConnectionStringBuilder(Normalize(connection)).Host;
        }
        catch
        {
            return null;
        }
    }

    public static bool IsRenderHost(string? host)
    {
        if (string.IsNullOrWhiteSpace(host)) return false;
        return host.Contains("render.com", StringComparison.OrdinalIgnoreCase)
            || host.StartsWith("dpg-", StringComparison.OrdinalIgnoreCase);
    }
}
