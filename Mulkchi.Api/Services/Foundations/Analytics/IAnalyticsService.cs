using System.Threading.Tasks;

namespace Mulkchi.Api.Services.Foundations.Analytics;

public interface IAnalyticsService
{
    Task<object> GetMarketOverviewAsync();
    Task<object> GetAnalyticsByRegionAsync();
    Task<object> GetPriceTrendsAsync();
}
