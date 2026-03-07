using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Models.Foundations.AIs;
using Mulkchi.Api.Models.Foundations.Discounts;
using Mulkchi.Api.Models.Foundations.HomeRequests;
using Mulkchi.Api.Models.Foundations.Payments;
using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.RentalContracts;
using Mulkchi.Api.Models.Foundations.Reviews;
using Mulkchi.Api.Models.Foundations.Users;

namespace Mulkchi.Api.Brokers.Storages;

public partial class StorageBroker : DbContext, IStorageBroker
{
    private readonly IConfiguration configuration;
    private readonly IWebHostEnvironment environment;

    public StorageBroker(
        DbContextOptions<StorageBroker> options,
        IConfiguration configuration,
        IWebHostEnvironment environment)
        : base(options)
    {
        this.configuration = configuration;
        this.environment = environment;

        if (this.environment.IsDevelopment())
        {
            this.Database.EnsureCreated();
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AiRecommendation>(entity =>
        {
            entity.Property(p => p.Score).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Discount>(entity =>
        {
            entity.Property(p => p.Value).HasPrecision(18, 2);
            entity.Property(p => p.MaxDiscountAmount).HasPrecision(18, 2);
        });

        modelBuilder.Entity<HomeRequest>(entity =>
        {
            entity.Property(p => p.TotalPrice).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.Property(p => p.Amount).HasPrecision(18, 2);
            entity.Property(p => p.PlatformFee).HasPrecision(18, 2);
            entity.Property(p => p.HostReceives).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Property>(entity =>
        {
            entity.Property(p => p.MonthlyRent).HasPrecision(18, 2);
            entity.Property(p => p.SalePrice).HasPrecision(18, 2);
            entity.Property(p => p.PricePerNight).HasPrecision(18, 2);
            entity.Property(p => p.SecurityDeposit).HasPrecision(18, 2);
            entity.Property(p => p.AverageRating).HasPrecision(18, 2);
        });

        modelBuilder.Entity<RentalContract>(entity =>
        {
            entity.Property(p => p.MonthlyRent).HasPrecision(18, 2);
            entity.Property(p => p.SecurityDeposit).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.Property(p => p.OverallRating).HasPrecision(18, 2);
            entity.Property(p => p.CleanlinessRating).HasPrecision(18, 2);
            entity.Property(p => p.LocationRating).HasPrecision(18, 2);
            entity.Property(p => p.ValueRating).HasPrecision(18, 2);
            entity.Property(p => p.CommunicationRating).HasPrecision(18, 2);
            entity.Property(p => p.AccuracyRating).HasPrecision(18, 2);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(p => p.Rating).HasPrecision(18, 2);
            entity.Property(p => p.ResponseRate).HasPrecision(18, 2);
        });
    }
}
