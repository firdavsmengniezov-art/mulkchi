using Mulkchi.Api.Models.Foundations.Favorites;
using Mulkchi.Api.Models.Foundations.Favorites.Exceptions;
using Xeptions;

namespace Mulkchi.Api.Services.Foundations.Favorites;

public partial class FavoriteService
{
    private void ValidateFavoriteOnAdd(Favorite favorite)
    {
        ValidateFavoriteIsNotNull(favorite);
        Validate(
        (Rule: IsInvalid(favorite.Id), Parameter: nameof(Favorite.Id)),
        (Rule: IsInvalid(favorite.UserId), Parameter: nameof(Favorite.UserId)),
        (Rule: IsInvalid(favorite.PropertyId), Parameter: nameof(Favorite.PropertyId)));
    }

    private void ValidateFavoriteOnModify(Favorite favorite)
    {
        ValidateFavoriteIsNotNull(favorite);
        Validate(
        (Rule: IsInvalid(favorite.Id), Parameter: nameof(Favorite.Id)),
        (Rule: IsInvalid(favorite.UserId), Parameter: nameof(Favorite.UserId)),
        (Rule: IsInvalid(favorite.PropertyId), Parameter: nameof(Favorite.PropertyId)));
    }

    private static void ValidateFavoriteId(Guid favoriteId)
    {
        if (favoriteId == Guid.Empty)
        {
            throw new InvalidFavoriteException(
                message: "Favorite id is invalid.");
        }
    }

    private static void ValidateFavoriteIsNotNull(Favorite favorite)
    {
        if (favorite is null)
            throw new NullFavoriteException(message: "Favorite is null.");
    }

    private static dynamic IsInvalid(Guid id) => new
    {
        Condition = id == Guid.Empty,
        Message = "Id is required."
    };

    private static dynamic IsInvalid(string text) => new
    {
        Condition = string.IsNullOrWhiteSpace(text),
        Message = "Value is required."
    };

    private void Validate(params (dynamic Rule, string Parameter)[] validations)
    {
        var invalidFavoriteException =
            new InvalidFavoriteException(message: "Favorite data is invalid.");

        foreach ((dynamic rule, string parameter) in validations)
        {
            if (rule.Condition)
                invalidFavoriteException.UpsertDataList(parameter, rule.Message);
        }

        invalidFavoriteException.ThrowIfContainsErrors();
    }
}
