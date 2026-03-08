using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Favorites;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Favorites;

public partial class FavoriteServiceTests
{
    [Fact]
    public async Task ShouldAddFavoriteAsync()
    {
        // given
        Favorite randomFavorite = CreateRandomFavorite();
        Favorite inputFavorite = randomFavorite;
        Favorite expectedFavorite = inputFavorite;

        IQueryable<Favorite> emptyFavorites = new List<Favorite>().AsQueryable();

        this.storageBrokerMock.Setup(broker =>
            broker.SelectAllFavorites())
                .Returns(emptyFavorites);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertFavoriteAsync(inputFavorite))
                .ReturnsAsync(expectedFavorite);

        // when
        Favorite actualFavorite = await this.favoriteService.AddFavoriteAsync(inputFavorite);

        // then
        actualFavorite.Should().BeEquivalentTo(expectedFavorite);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectAllFavorites(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertFavoriteAsync(inputFavorite),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
