using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.SavedSearches;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.SavedSearches;

public partial class SavedSearchServiceTests
{
    [Fact]
    public async Task ShouldModifySavedSearchAsync()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        SavedSearch randomSavedSearch = CreateRandomSavedSearch();
        SavedSearch inputSavedSearch = randomSavedSearch;
        inputSavedSearch.UpdatedAt = randomDateTimeOffset;
        SavedSearch expectedSavedSearch = inputSavedSearch;

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(randomDateTimeOffset);

        this.storageBrokerMock.Setup(broker =>
            broker.UpdateSavedSearchAsync(inputSavedSearch))
                .ReturnsAsync(expectedSavedSearch);

        // when
        SavedSearch actualSavedSearch = await this.savedSearchService.ModifySavedSearchAsync(inputSavedSearch);

        // then
        actualSavedSearch.Should().BeEquivalentTo(expectedSavedSearch);

        this.dateTimeBrokerMock.Verify(broker =>
            broker.GetCurrentDateTimeOffset(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.UpdateSavedSearchAsync(inputSavedSearch),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
