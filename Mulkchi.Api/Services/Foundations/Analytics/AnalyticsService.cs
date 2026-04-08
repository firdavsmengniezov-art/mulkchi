using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Models.Foundations.Properties;
using System.Linq;
using System.Threading.Tasks;

namespace Mulkchi.Api.Services.Foundations.Analytics;

public class AnalyticsService : IAnalyticsService
{
    private readonly StorageBroker storageBroker;

    public AnalyticsService(StorageBroker storageBroker)
    {
        this.storageBroker = storageBroker;
    }

    public async Task<object> GetMarketOverviewAsync()
    {
        var properties = this.storageBroker.Properties
            .Where(p => !p.DeletedDate.HasValue)
            .AsQueryable();

        var totalListings = await properties.CountAsync();
        var totalForSale = await properties.CountAsync(p => p.ListingType == ListingType.Sale);
        var totalForRent = await properties.CountAsync(
            p => p.ListingType == ListingType.Rent || p.ListingType == ListingType.ShortTermRent);

        var averageSalePrice = await properties
            .Where(p => p.SalePrice.HasValue && p.SalePrice > 0)
            .AverageAsync(p => (decimal?)p.SalePrice) ?? 0;

        var averageRentPrice = await properties
            .Where(p => p.MonthlyRent.HasValue && p.MonthlyRent > 0)
            .AverageAsync(p => (decimal?)p.MonthlyRent) ?? 0;

        return new
        {
            totalListings,
            totalForSale,
            totalForRent,
            averageSalePrice,
            averageRentPrice
        };
    }

    public async Task<object> GetAnalyticsByRegionAsync()
    {
        var regionData = await this.storageBroker.Properties
            .Where(p => !p.DeletedDate.HasValue)
            .GroupBy(p => p.Region)
            .Select(g => new
            {
                region = g.Key.ToString(),
                listingsCount = g.Count(),
                averageSalePrice = g
                    .Where(p => p.SalePrice.HasValue && p.SalePrice > 0)
                    .Average(p => (decimal?)p.SalePrice) ?? 0,
                averageRentPrice = g
                    .Where(p => p.MonthlyRent.HasValue && p.MonthlyRent > 0)
                    .Average(p => (decimal?)p.MonthlyRent) ?? 0
            })
            .OrderByDescending(r => r.listingsCount)
            .ToListAsync();

        return regionData;
    }

    public async Task<object> GetPriceTrendsAsync()
    {
        var twelveMonthsAgo = System.DateTimeOffset.UtcNow.AddMonths(-12);

        var priceTrends = await this.storageBroker.Properties
            .Where(p => !p.DeletedDate.HasValue && p.CreatedDate >= twelveMonthsAgo)
            .GroupBy(p => new { p.CreatedDate.Year, p.CreatedDate.Month })
            .Select(g => new
            {
                month = $"{g.Key.Year}-{g.Key.Month:D2}",
                averagePrice = g
                    .Where(p => p.SalePrice.HasValue && p.SalePrice > 0)
                    .Average(p => (decimal?)p.SalePrice) ?? 0,
                listingsCount = g.Count()
            })
            .OrderBy(x => x.month)
            .ToListAsync();

        return priceTrends;
    }
}
