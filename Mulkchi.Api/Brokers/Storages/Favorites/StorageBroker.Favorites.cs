using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Models.Foundations.Favorites;

namespace Mulkchi.Api.Brokers.Storages;

public partial class StorageBroker
{
    public DbSet<Favorite> Favorites { get; set; }

    public async ValueTask<Favorite> InsertFavoriteAsync(Favorite favorite)
    {
        var entry = await this.Favorites.AddAsync(favorite);
        await this.SaveChangesAsync();
        return entry.Entity;
    }

    public IQueryable<Favorite> SelectAllFavorites()
        => this.Favorites.AsQueryable();

    public async ValueTask<Favorite> SelectFavoriteByIdAsync(Guid favoriteId)
        => (await this.Favorites.FindAsync(favoriteId))!;

    public async ValueTask<Favorite> UpdateFavoriteAsync(Favorite favorite)
    {
        this.Entry(favorite).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return favorite;
    }

    public async ValueTask<Favorite> DeleteFavoriteByIdAsync(Guid favoriteId)
    {
        Favorite favorite = (await this.Favorites.FindAsync(favoriteId))!;
        favorite.DeletedDate = DateTimeOffset.UtcNow;
        this.Entry(favorite).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return favorite;
    }
}
