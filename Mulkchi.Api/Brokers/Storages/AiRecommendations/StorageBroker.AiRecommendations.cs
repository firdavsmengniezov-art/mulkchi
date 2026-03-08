using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Models.Foundations.AIs;

namespace Mulkchi.Api.Brokers.Storages;

public partial class StorageBroker
{
    public DbSet<AiRecommendation> AiRecommendations { get; set; }

    public async ValueTask<AiRecommendation> InsertAiRecommendationAsync(AiRecommendation aiRecommendation)
    {
        var entry = await this.AiRecommendations.AddAsync(aiRecommendation);
        await this.SaveChangesAsync();
        return entry.Entity;
    }

    public IQueryable<AiRecommendation> SelectAllAiRecommendations()
        => this.AiRecommendations.AsQueryable();

    public async ValueTask<AiRecommendation> SelectAiRecommendationByIdAsync(Guid aiRecommendationId)
        => (await this.AiRecommendations.FindAsync(aiRecommendationId))!;

    public async ValueTask<AiRecommendation> UpdateAiRecommendationAsync(AiRecommendation aiRecommendation)
    {
        this.Entry(aiRecommendation).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return aiRecommendation;
    }

    public async ValueTask<AiRecommendation> DeleteAiRecommendationByIdAsync(Guid aiRecommendationId)
    {
        AiRecommendation aiRecommendation = (await this.AiRecommendations.FindAsync(aiRecommendationId))!;
        aiRecommendation.DeletedDate = DateTimeOffset.UtcNow;
        this.Entry(aiRecommendation).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return aiRecommendation;
    }
}
