using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Models.Foundations.Properties;
using System.Linq;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly StorageBroker storageBroker;

    public AnalyticsController(StorageBroker storageBroker)
    {
        this.storageBroker = storageBroker;
    }

    [HttpGet("market-overview")]
    public async Task<ActionResult> GetMarketOverview()
    {
        try
        {
            var properties = this.storageBroker.Properties
                .Where(p => !p.DeletedDate.HasValue)
                .AsQueryable();

            var totalListings = await properties.CountAsync();
            var totalForSale = await properties.CountAsync(p => p.ListingType == ListingType.Sale);
            var totalForRent = await properties.CountAsync(p => p.ListingType == ListingType.Rent || p.ListingType == ListingType.ShortTermRent);
            
            var averageSalePrice = await properties
                .Where(p => p.SalePrice.HasValue && p.SalePrice > 0)
                .AverageAsync(p => p.SalePrice.Value);
            
            var averageRentPrice = await properties
                .Where(p => p.MonthlyRent.HasValue && p.MonthlyRent > 0)
                .AverageAsync(p => p.MonthlyRent.Value);

            return Ok(new
            {
                totalListings,
                totalForSale,
                totalForRent,
                averageSalePrice,
                averageRentPrice
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    [HttpGet("by-region")]
    public async Task<ActionResult> GetAnalyticsByRegion()
    {
        try
        {
            var regionData = await this.storageBroker.Properties
                .Where(p => !p.DeletedDate.HasValue)
                .GroupBy(p => p.Region)
                .Select(g => new
                {
                    region = g.Key.ToString(),
                    listingsCount = g.Count(),
                    averageSalePrice = g.Where(p => p.SalePrice.HasValue && p.SalePrice > 0).Average(p => p.SalePrice.Value),
                    averageRentPrice = g.Where(p => p.MonthlyRent.HasValue && p.MonthlyRent > 0).Average(p => p.MonthlyRent.Value)
                })
                .OrderByDescending(r => r.listingsCount)
                .ToListAsync();

            return Ok(regionData);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    [HttpGet("price-trends")]
    public async Task<ActionResult> GetPriceTrends()
    {
        try
        {
            var twelveMonthsAgo = DateTimeOffset.UtcNow.AddMonths(-12);
            
            var priceTrends = await this.storageBroker.Properties
                .Where(p => !p.DeletedDate.HasValue && p.CreatedDate >= twelveMonthsAgo)
                .GroupBy(p => new { 
                    Year = p.CreatedDate.Year, 
                    Month = p.CreatedDate.Month 
                })
                .Select(g => new
                {
                    month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    averagePrice = g.Where(p => p.SalePrice.HasValue && p.SalePrice > 0).Average(p => p.SalePrice.Value),
                    listingsCount = g.Count()
                })
                .OrderBy(x => x.month)
                .ToListAsync();

            return Ok(priceTrends);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }
}
