using ConstructionManagement.Domain.Entities;
using ConstructionManagement.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ConstructionManagement.Infrastructure.Persistence;

public sealed class ConstructionDbContext(DbContextOptions<ConstructionDbContext> options) : IdentityDbContext<ApplicationUser, Microsoft.AspNetCore.Identity.IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<BoqItem> BoqItems => Set<BoqItem>();
    public DbSet<Material> Materials => Set<Material>();
    public DbSet<LabourAttendance> LabourAttendance => Set<LabourAttendance>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<ProgressUpdate> ProgressUpdates => Set<ProgressUpdate>();
    public DbSet<SitePhoto> SitePhotos => Set<SitePhoto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasIndex(project => project.ProjectCode).IsUnique();
            entity.Property(project => project.EstimatedBudget).HasPrecision(18, 2);
            entity.Property(project => project.ActualCost).HasPrecision(18, 2);
            entity.Property(project => project.ProgressPercent).HasPrecision(5, 2);
            entity.HasOne(project => project.Client).WithMany(client => client.Projects).HasForeignKey(project => project.ClientId).OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<Client>().HasIndex(client => client.Name);
        modelBuilder.Entity<BoqItem>().HasIndex(item => item.ProjectId);
        modelBuilder.Entity<Expense>().HasIndex(expense => new { expense.ProjectId, expense.Date });
        modelBuilder.Entity<Expense>().HasIndex(expense => expense.PhaseId);
        modelBuilder.Entity<Payment>().HasIndex(payment => new { payment.ProjectId, payment.Status });
        modelBuilder.Entity<Payment>().HasIndex(payment => payment.PhaseId);
        modelBuilder.Entity<ProgressUpdate>().HasIndex(update => new { update.ProjectId, update.Date });
        modelBuilder.Entity<SitePhoto>().HasIndex(photo => new { photo.ProjectId, photo.CapturedUtc });
        modelBuilder.Entity<BoqItem>().Property(item => item.EstimatedRate).HasPrecision(18, 2);
        modelBuilder.Entity<BoqItem>().Property(item => item.ActualRate).HasPrecision(18, 2);
        modelBuilder.Entity<Material>().Property(material => material.UnitPrice).HasPrecision(18, 2);
        modelBuilder.Entity<Expense>().Property(expense => expense.Amount).HasPrecision(18, 2);
        modelBuilder.Entity<Payment>().Property(payment => payment.Amount).HasPrecision(18, 2);
        modelBuilder.Entity<LabourAttendance>().Property(attendance => attendance.DailyWage).HasPrecision(18, 2);
    }
}
