using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Models.Foundations.Reviews;

namespace Mulkchi.Api.Brokers.Storages;

public partial class StorageBroker
{
    public DbSet<Review> Reviews { get; set; }

    public async ValueTask<Review> InsertReviewAsync(Review review)
    {
        var entry = await this.Reviews.AddAsync(review);
        await this.SaveChangesAsync();
        return entry.Entity;
    }

    public IQueryable<Review> SelectAllReviews()
        => this.Reviews.AsQueryable();

    public async ValueTask<Review> SelectReviewByIdAsync(Guid reviewId)
        => (await this.Reviews.FindAsync(reviewId))!;

    public async ValueTask<Review> UpdateReviewAsync(Review review)
    {
        this.Entry(review).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return review;
    }

    public async ValueTask<Review> DeleteReviewByIdAsync(Guid reviewId)
    {
        Review review = (await this.Reviews.FindAsync(reviewId))!;
        review.DeletedDate = DateTimeOffset.UtcNow;
        this.Entry(review).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return review;
    }
}
