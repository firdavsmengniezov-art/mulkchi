using Mulkchi.Api.Models.Foundations.Favorites;
using Mulkchi.Api.Models.Foundations.Favorites.Exceptions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;

namespace Mulkchi.Api.Services.Foundations.Favorites;

public partial class FavoriteService : IFavoriteService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;

    public FavoriteService(
        IStorageBroker storageBroker,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker)
    {
        this.storageBroker = storageBroker;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
    }

    public ValueTask<Favorite> AddFavoriteAsync(Favorite favorite) =>
        TryCatch(async () =>
        {
            ValidateFavoriteOnAdd(favorite);

            bool alreadyExists = this.storageBroker
                .SelectAllFavorites()
                .Any(f => f.UserId == favorite.UserId && f.PropertyId == favorite.PropertyId);

            if (alreadyExists)
                throw new AlreadyExistsFavoriteException(
                    message: "Favorite already exists for this user and property.");

            var now = this.dateTimeBroker.GetCurrentDateTimeOffset();
            favorite.CreatedDate = now;
            favorite.UpdatedDate = now;

            return await this.storageBroker.InsertFavoriteAsync(favorite);
        });

    public IQueryable<Favorite> RetrieveAllFavorites() =>
        TryCatch(() => this.storageBroker.SelectAllFavorites());

    public ValueTask<Favorite> RetrieveFavoriteByIdAsync(Guid favoriteId) =>
        TryCatch(async () =>
        {
            ValidateFavoriteId(favoriteId);
            Favorite maybeFavorite = await this.storageBroker.SelectFavoriteByIdAsync(favoriteId);

            if (maybeFavorite is null)
                throw new NotFoundFavoriteException(favoriteId);

            return maybeFavorite;
        });

    public ValueTask<Favorite> ModifyFavoriteAsync(Favorite favorite) =>
        TryCatch(async () =>
        {
            ValidateFavoriteOnModify(favorite);
            favorite.UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset();
            return await this.storageBroker.UpdateFavoriteAsync(favorite);
        });

    public ValueTask<Favorite> RemoveFavoriteByIdAsync(Guid favoriteId) =>
        TryCatch(async () =>
        {
            ValidateFavoriteId(favoriteId);
            return await this.storageBroker.DeleteFavoriteByIdAsync(favoriteId);
        });
}
