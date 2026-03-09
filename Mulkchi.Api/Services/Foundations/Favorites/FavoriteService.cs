using Mulkchi.Api.Models.Foundations.Favorites;
using Mulkchi.Api.Models.Foundations.Favorites.Exceptions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Services.Foundations.Auth;

namespace Mulkchi.Api.Services.Foundations.Favorites;

public partial class FavoriteService : IFavoriteService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;
    private readonly ICurrentUserService currentUserService;

    public FavoriteService(
        IStorageBroker storageBroker,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker,
        ICurrentUserService currentUserService)
    {
        this.storageBroker = storageBroker;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
        this.currentUserService = currentUserService;
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
            
            // Check authorization: only user can access their own favorites
            var currentUserId = this.currentUserService.GetCurrentUserId();
            if (!currentUserId.HasValue || (!this.currentUserService.IsInRole("Admin") && maybeFavorite.UserId != currentUserId.Value))
            {
                throw new UnauthorizedAccessException("You can only access your own favorites.");
            }

            return maybeFavorite;
        });

    public ValueTask<Favorite> ModifyFavoriteAsync(Favorite favorite) =>
        TryCatch(async () =>
        {
            ValidateFavoriteOnModify(favorite);
            
            // Get existing favorite to check ownership
            Favorite existingFavorite = await this.storageBroker.SelectFavoriteByIdAsync(favorite.Id);
            if (existingFavorite == null)
                throw new NotFoundFavoriteException(favorite.Id);
            
            // Check authorization: only user can modify their own favorites
            var currentUserId = this.currentUserService.GetCurrentUserId();
            if (!currentUserId.HasValue || (!this.currentUserService.IsInRole("Admin") && existingFavorite.UserId != currentUserId.Value))
            {
                throw new UnauthorizedAccessException("You can only modify your own favorites.");
            }
            
            favorite.UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset();
            return await this.storageBroker.UpdateFavoriteAsync(favorite);
        });

    public ValueTask<Favorite> RemoveFavoriteByIdAsync(Guid favoriteId) =>
        TryCatch(async () =>
        {
            ValidateFavoriteId(favoriteId);
            
            // Get existing favorite to check ownership
            Favorite existingFavorite = await this.storageBroker.SelectFavoriteByIdAsync(favoriteId);
            if (existingFavorite == null)
                throw new NotFoundFavoriteException(favoriteId);
            
            // Check authorization: only user can delete their own favorites
            var currentUserId = this.currentUserService.GetCurrentUserId();
            if (!currentUserId.HasValue || (!this.currentUserService.IsInRole("Admin") && existingFavorite.UserId != currentUserId.Value))
            {
                throw new UnauthorizedAccessException("You can only delete your own favorites.");
            }
            
            return await this.storageBroker.DeleteFavoriteByIdAsync(favoriteId);
        });
}
