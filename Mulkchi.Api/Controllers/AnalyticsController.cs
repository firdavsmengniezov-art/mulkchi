using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.AI;
using Mulkchi.Api.Services.Foundations.AI;
using Mulkchi.Api.Services.Foundations.Analytics;
using System;
using System.Threading.Tasks;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService analyticsService;
    private readonly IPriceRecommendationService priceRecommendationService;

    public AnalyticsController(
        IAnalyticsService analyticsService,
        IPriceRecommendationService priceRecommendationService)
    {
        this.analyticsService = analyticsService;
        this.priceRecommendationService = priceRecommendationService;
    }

    [HttpGet("market-overview")]
    public async Task<ActionResult> GetMarketOverview()
    {
        try
        {
            var overview = await this.analyticsService.GetMarketOverviewAsync();
            return Ok(overview);
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
            var regionData = await this.analyticsService.GetAnalyticsByRegionAsync();
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
            var trends = await this.analyticsService.GetPriceTrendsAsync();
            return Ok(trends);
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
