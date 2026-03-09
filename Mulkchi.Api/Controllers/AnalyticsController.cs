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
            
            var saleProperties = await properties
                .Where(p => p.SalePrice.HasValue && p.SalePrice > 0)
                .ToListAsync();
            
            var rentProperties = await properties
                .Where(p => p.MonthlyRent.HasValue && p.MonthlyRent > 0)
                .ToListAsync();
            
            var averageSalePrice = saleProperties.Any() 
                ? saleProperties.Average(p => p.SalePrice.Value)
                : 0;
            
            var averageRentPrice = rentProperties.Any() 
                ? rentProperties.Average(p => p.MonthlyRent.Value)
                : 0;

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
            var properties = await this.storageBroker.Properties
                .Where(p => !p.DeletedDate.HasValue)
                .ToListAsync();

            var regionData = properties
                .GroupBy(p => p.Region)
                .Select(g => new
                {
                    region = g.Key.ToString(),
                    listingsCount = g.Count(),
                    averageSalePrice = g.Where(p => p.SalePrice.HasValue && p.SalePrice > 0).Any()
                        ? g.Where(p => p.SalePrice.HasValue && p.SalePrice > 0).Average(p => p.SalePrice.Value)
                        : 0,
                    averageRentPrice = g.Where(p => p.MonthlyRent.HasValue && p.MonthlyRent > 0).Any()
                        ? g.Where(p => p.MonthlyRent.HasValue && p.MonthlyRent > 0).Average(p => p.MonthlyRent.Value)
                        : 0
                })
                .OrderByDescending(r => r.listingsCount)
                .ToList();

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
            
            var properties = await this.storageBroker.Properties
                .Where(p => !p.DeletedDate.HasValue && p.CreatedDate >= twelveMonthsAgo)
                .ToListAsync();
            
            var priceTrends = properties
                .GroupBy(p => new { 
                    Year = p.CreatedDate.Year, 
                    Month = p.CreatedDate.Month 
                })
                .Select(g => new
                {
                    month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    averagePrice = g.Where(p => p.SalePrice.HasValue && p.SalePrice > 0).Any()
                        ? g.Where(p => p.SalePrice.HasValue && p.SalePrice > 0).Average(p => p.SalePrice.Value)
                        : 0,
                    listingsCount = g.Count()
                })
                .OrderBy(x => x.month)
                .ToList();

            return Ok(priceTrends);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }
}
