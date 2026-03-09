using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Favorites;

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

        this.storageBrokerMock.Setup(broker =>
            broker.DeleteFavoriteByIdAsync(randomFavorite.Id))
                .ReturnsAsync(expectedFavorite);

        // when
        Favorite actualFavorite = await this.favoriteService.RemoveFavoriteByIdAsync(randomFavorite.Id);

        // then
        actualFavorite.Should().BeEquivalentTo(expectedFavorite);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectFavoriteByIdAsync(randomFavorite.Id),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.DeleteFavoriteByIdAsync(randomFavorite.Id),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
