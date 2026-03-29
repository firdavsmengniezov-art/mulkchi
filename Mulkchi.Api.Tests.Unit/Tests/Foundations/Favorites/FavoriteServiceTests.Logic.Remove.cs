using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Favorites;
using Mulkchi.Api.Models.Foundations.Properties;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Favorites;

public partial class FavoriteServiceTests
{
    [Fact]
    public async Task ShouldRemoveFavoriteByIdAsync()
    {
        // given
        Favorite randomFavorite = CreateRandomFavorite();
        Favorite expectedFavorite = randomFavorite;

        // Set up CurrentUserService mock to return the favorite's user ID
        this.currentUserServiceMock.Setup(x => x.GetCurrentUserId())
            .Returns(randomFavorite.UserId);
        this.currentUserServiceMock.Setup(x => x.IsInRole("Admin"))
            .Returns(false);

        // Mock the SelectFavoriteByIdAsync call that the authorization check makes
        this.storageBrokerMock.Setup(broker =>
            broker.SelectFavoriteByIdAsync(randomFavorite.Id))
                .ReturnsAsync(randomFavorite);

        // Mock the SelectPropertyByIdAsync call for favorites count update
        this.storageBrokerMock.Setup(broker =>
            broker.SelectPropertyByIdAsync(randomFavorite.PropertyId))
                .ReturnsAsync(new Mulkchi.Api.Models.Foundations.Properties.Property 
                { 
                    Id = randomFavorite.PropertyId,
                    FavoritesCount = 1,
                    UpdatedDate = DateTimeOffset.UtcNow
                });

        this.storageBrokerMock.Setup(broker =>
            broker.DeleteFavoriteByIdAsync(randomFavorite.Id))
                .ReturnsAsync(expectedFavorite);

        this.storageBrokerMock.Setup(broker =>
            broker.UpdatePropertyAsync(It.IsAny<Mulkchi.Api.Models.Foundations.Properties.Property>()))
                .ReturnsAsync(It.IsAny<Mulkchi.Api.Models.Foundations.Properties.Property>());

        // when
        Favorite actualFavorite = await this.favoriteService.RemoveFavoriteByIdAsync(randomFavorite.Id);

        // then
        actualFavorite.Should().BeEquivalentTo(expectedFavorite);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectFavoriteByIdAsync(randomFavorite.Id),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectPropertyByIdAsync(randomFavorite.PropertyId),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.DeleteFavoriteByIdAsync(randomFavorite.Id),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.UpdatePropertyAsync(It.IsAny<Mulkchi.Api.Models.Foundations.Properties.Property>()),
            Times.Once);
    }
}
