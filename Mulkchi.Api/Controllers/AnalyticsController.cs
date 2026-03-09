using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Models.Foundations.AI;
using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Services.Foundations.AI;
using System.Linq;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly StorageBroker storageBroker;
    private readonly IPriceRecommendationService priceRecommendationService;

    public AnalyticsController(
        StorageBroker storageBroker,
        IPriceRecommendationService priceRecommendationService)
    {
        this.storageBroker = storageBroker;
        this.priceRecommendationService = priceRecommendationService;
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

    [HttpPost("predict-price")]
    public async Task<ActionResult<PriceRecommendationResponse>> PredictPrice(PriceRecommendationRequest request)
    {
        try
        {
            var prediction = await this.priceRecommendationService.PredictPriceAsync(request);
            return Ok(prediction);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    [HttpPost("train-model")]
    [Authorize(Roles = "Admin")] // Only admins can trigger model training
    public async Task<ActionResult> TrainModel()
    {
        try
        {
            await this.priceRecommendationService.TrainModelAsync();
            return Ok(new { message = "Model training completed successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }

    [HttpGet("model-status")]
    public async Task<ActionResult> GetModelStatus()
    {
        try
        {
            var isTrained = await this.priceRecommendationService.IsModelTrainedAsync();
            var trainingDataCount = await this.priceRecommendationService.GetTrainingDataCountAsync();

            return Ok(new
            {
                isTrained,
                trainingDataCount,
                minimumRequiredData = 10,
                needsTraining = trainingDataCount >= 10 && !isTrained
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", error = ex.Message });
        }
    }
}
