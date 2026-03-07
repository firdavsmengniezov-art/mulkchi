using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Favorites;
using Mulkchi.Api.Models.Foundations.Favorites.Exceptions;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Favorites;

public partial class FavoriteServiceTests
{
    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenNullFavorite()
    {
        // given
        Favorite? inputFavorite = null;

        // when
        ValueTask<Favorite> addFavoriteTask =
            this.favoriteService.AddFavoriteAsync(inputFavorite!);

        // then
        FavoriteValidationException actualException =
            await Assert.ThrowsAsync<FavoriteValidationException>(
                testCode: async () => await addFavoriteTask);

        actualException.InnerException.Should().BeOfType<NullFavoriteException>();

        this.storageBrokerMock.Verify(broker =>
            broker.InsertFavoriteAsync(It.IsAny<Favorite>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenIdIsEmpty()
    {
        // given
        Favorite randomFavorite = CreateRandomFavorite();
        randomFavorite.Id = Guid.Empty;

        // when
        ValueTask<Favorite> addFavoriteTask =
            this.favoriteService.AddFavoriteAsync(randomFavorite);

        // then
        await Assert.ThrowsAsync<FavoriteValidationException>(
            testCode: async () => await addFavoriteTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertFavoriteAsync(It.IsAny<Favorite>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenUserIdIsEmpty()
    {
        // given
        Favorite randomFavorite = CreateRandomFavorite();
        randomFavorite.UserId = Guid.Empty;

        // when
        ValueTask<Favorite> addFavoriteTask =
            this.favoriteService.AddFavoriteAsync(randomFavorite);

        // then
        await Assert.ThrowsAsync<FavoriteValidationException>(
            testCode: async () => await addFavoriteTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertFavoriteAsync(It.IsAny<Favorite>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenPropertyIdIsEmpty()
    {
        // given
        Favorite randomFavorite = CreateRandomFavorite();
        randomFavorite.PropertyId = Guid.Empty;

        // when
        ValueTask<Favorite> addFavoriteTask =
            this.favoriteService.AddFavoriteAsync(randomFavorite);

        // then
        await Assert.ThrowsAsync<FavoriteValidationException>(
            testCode: async () => await addFavoriteTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertFavoriteAsync(It.IsAny<Favorite>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
