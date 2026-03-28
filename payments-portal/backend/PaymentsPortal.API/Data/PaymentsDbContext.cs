using Microsoft.EntityFrameworkCore;
using PaymentsPortal.API.Models;

namespace PaymentsPortal.API.Data;

public class PaymentsDbContext : DbContext
{
    public PaymentsDbContext(DbContextOptions<PaymentsDbContext> options) : base(options) { }

    public DbSet<Payment> Payments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Reference).IsRequired().HasMaxLength(30);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Currency).IsRequired().HasMaxLength(3);
            entity.Property(e => e.ClientRequestId).IsRequired().HasMaxLength(36);
            entity.HasIndex(e => e.ClientRequestId).IsUnique();
            entity.HasIndex(e => new { e.Reference }).IsUnique();
        });
    }
}
