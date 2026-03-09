using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Favorites;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Favorites;

public partial class FavoriteServiceTests
{
    [Fact]
    public async Task ShouldModifyFavoriteAsync()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        Favorite randomFavorite = CreateRandomFavorite();
        Favorite inputFavorite = randomFavorite;
        inputFavorite.UpdatedDate = randomDateTimeOffset;
        Favorite expectedFavorite = inputFavorite;

        // Set up CurrentUserService mock to return the favorite's user ID
        this.currentUserServiceMock.Setup(x => x.GetCurrentUserId())
            .Returns(inputFavorite.UserId);
        this.currentUserServiceMock.Setup(x => x.IsInRole("Admin"))
            .Returns(false);

        // Mock the SelectFavoriteByIdAsync call that the authorization check makes
        this.storageBrokerMock.Setup(broker =>
            broker.SelectFavoriteByIdAsync(inputFavorite.Id))
                .ReturnsAsync(randomFavorite);

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(randomDateTimeOffset);

        this.storageBrokerMock.Setup(broker =>
            broker.UpdateFavoriteAsync(inputFavorite))
                .ReturnsAsync(expectedFavorite);

        // when
        Favorite actualFavorite = await this.favoriteService.ModifyFavoriteAsync(inputFavorite);

        // then
        actualFavorite.Should().BeEquivalentTo(expectedFavorite);

        this.dateTimeBrokerMock.Verify(broker =>
            broker.GetCurrentDateTimeOffset(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectFavoriteByIdAsync(inputFavorite.Id),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.UpdateFavoriteAsync(inputFavorite),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
