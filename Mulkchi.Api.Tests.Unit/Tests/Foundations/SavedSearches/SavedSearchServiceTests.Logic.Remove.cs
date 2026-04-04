using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.SavedSearches;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.SavedSearches;

public partial class SavedSearchServiceTests
{
    [Fact]
    public async Task ShouldRemoveSavedSearchByIdAsync()
    {
        // given
        SavedSearch randomSavedSearch = CreateRandomSavedSearch();
        SavedSearch storedSavedSearch = randomSavedSearch;
        storedSavedSearch.DeletedAt = null;

        this.storageBrokerMock.Setup(broker =>
            broker.SelectSavedSearchByIdAsync(randomSavedSearch.Id))
                .ReturnsAsync(storedSavedSearch);

        this.storageBrokerMock.Setup(broker =>
            broker.UpdateSavedSearchAsync(It.IsAny<SavedSearch>()))
                .ReturnsAsync(randomSavedSearch);

        // when
        SavedSearch actualSavedSearch = await this.savedSearchService.RemoveSavedSearchByIdAsync(randomSavedSearch.Id);

        // then
        actualSavedSearch.Should().BeEquivalentTo(randomSavedSearch);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectSavedSearchByIdAsync(randomSavedSearch.Id),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.UpdateSavedSearchAsync(It.IsAny<SavedSearch>()),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
