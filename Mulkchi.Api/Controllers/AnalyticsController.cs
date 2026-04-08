using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Models.Foundations.AI;
using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Services.Foundations.AI;

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
            var totalForRent = await properties.CountAsync(
                p => p.ListingType == ListingType.Rent || p.ListingType == ListingType.ShortTermRent);

            var averageSalePrice = await properties
                .Where(p => p.SalePrice.HasValue && p.SalePrice > 0)
                .AverageAsync(p => (decimal?)p.SalePrice) ?? 0;

            var averageRentPrice = await properties
                .Where(p => p.MonthlyRent.HasValue && p.MonthlyRent > 0)
                .AverageAsync(p => (decimal?)p.MonthlyRent) ?? 0;

            return Ok(new
            {
                totalListings,
                totalForSale,
                totalForRent,
                averageSalePrice,
                averageRentPrice
            });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Internal server error." });
        }
    }

    [HttpGet("by-region")]
    public async Task<ActionResult> GetAnalyticsByRegion()
    {
        try
        {
            // GroupBy executed in the database — no ToListAsync() before grouping
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

            return Ok(regionData);
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Internal server error." });
        }
    }

    [HttpGet("price-trends")]
    public async Task<ActionResult> GetPriceTrends()
    {
        try
        {
            var twelveMonthsAgo = DateTimeOffset.UtcNow.AddMonths(-12);

            // GroupBy executed in the database — no ToListAsync() before grouping
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

            return Ok(priceTrends);
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Internal server error." });
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
        catch (Exception)
        {
            return StatusCode(500, new { message = "Internal server error." });
        }
    }

    [HttpPost("train-model")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> TrainModel()
    {
        try
        {
            await this.priceRecommendationService.TrainModelAsync();
            return Ok(new { message = "Model training completed successfully" });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Internal server error." });
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
        catch (Exception)
        {
            return StatusCode(500, new { message = "Internal server error." });
        }
    }
}
