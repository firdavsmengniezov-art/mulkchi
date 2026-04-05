using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using Mulkchi.Api.Models.Foundations.SavedSearches;
using Mulkchi.Api.Models.Foundations.SavedSearches.Exceptions;
using Mulkchi.Api.Services.Foundations.SavedSearches;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;

namespace Mulkchi.Api.Tests.Unit.Services.Foundations.SavedSearches
{
    public class SavedSearchServiceTests
    {
        private readonly Mock<IStorageBroker> storageBrokerMock;
        private readonly Mock<ILoggingBroker> loggingBrokerMock;
        private readonly Mock<IDateTimeBroker> dateTimeBrokerMock;
        private readonly SavedSearchService savedSearchService;

        public SavedSearchServiceTests()
        {
            this.storageBrokerMock = new Mock<IStorageBroker>();
            this.loggingBrokerMock = new Mock<ILoggingBroker>();
            this.dateTimeBrokerMock = new Mock<IDateTimeBroker>();
            this.savedSearchService = new SavedSearchService(
                storageBrokerMock.Object,
                loggingBrokerMock.Object,
                dateTimeBrokerMock.Object);
        }

        [Fact]
        public async Task ShouldAddSavedSearchOnValidRequest()
        {
            // Arrange
            var savedSearch = new SavedSearch
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Name = "Test Search",
                City = "Tashkent",
                Type = Models.Foundations.Properties.PropertyType.Apartment,
                ListingType = Models.Foundations.Properties.ListingType.Rent,
                MinPrice = 100000,
                MaxPrice = 500000,
                MinArea = 50,
                MaxArea = 150,
                MinBedrooms = 2,
                IsActive = true,
                NotifyByEmail = true,
                NotifyByPush = true,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            var expectedDateTime = DateTimeOffset.UtcNow;
            this.dateTimeBrokerMock
                .Setup(broker => broker.GetCurrentDateTimeOffset())
                .Returns(expectedDateTime);

            this.storageBrokerMock
                .Setup(broker => broker.InsertSavedSearchAsync(It.IsAny<SavedSearch>()))
                .ReturnsAsync(savedSearch);

            // Act
            var actualSavedSearch = await this.savedSearchService.AddSavedSearchAsync(savedSearch);

            // Assert
            actualSavedSearch.Should().BeEquivalentTo(savedSearch);
            savedSearch.CreatedAt.Should().Be(expectedDateTime);
            savedSearch.UpdatedAt.Should().Be(expectedDateTime);

            this.storageBrokerMock.Verify(
                broker => broker.InsertSavedSearchAsync(It.IsAny<SavedSearch>()),
                Times.Once);

            this.loggingBrokerMock.Verify(
                broker => broker.LogError(It.IsAny<Exception>()),
                Times.Never);
        }

        [Fact]
        public async Task ShouldThrowValidationExceptionOnInvalidSavedSearch()
        {
            // Arrange
            var invalidSavedSearch = new SavedSearch
            {
                Id = Guid.Empty,
                UserId = Guid.NewGuid(),
                Name = "",
                City = "",
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            // Act & Assert
            await Assert.ThrowsAsync<SavedSearchValidationException>(
                async () => await this.savedSearchService.AddSavedSearchAsync(invalidSavedSearch));
        }

        [Fact]
        public async Task ShouldRetrieveSavedSearchById()
        {
            // Arrange
            var savedSearchId = Guid.NewGuid();
            var expectedSavedSearch = new SavedSearch
            {
                Id = savedSearchId,
                UserId = Guid.NewGuid(),
                Name = "Test Search",
                City = "Tashkent",
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            this.storageBrokerMock
                .Setup(broker => broker.SelectSavedSearchByIdAsync(savedSearchId))
                .ReturnsAsync(expectedSavedSearch);

            // Act
            var actualSavedSearch = await this.savedSearchService.RetrieveSavedSearchByIdAsync(savedSearchId);

            // Assert
            actualSavedSearch.Should().BeEquivalentTo(expectedSavedSearch);
            this.storageBrokerMock.Verify(
                broker => broker.SelectSavedSearchByIdAsync(savedSearchId),
                Times.Once);
        }

        [Fact]
        public async Task ShouldThrowNotFoundExceptionOnNonExistentSavedSearch()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();

            this.storageBrokerMock
                .Setup(broker => broker.SelectSavedSearchByIdAsync(nonExistentId))
                .ReturnsAsync((SavedSearch?)null);

            // Act & Assert
            await Assert.ThrowsAsync<SavedSearchDependencyValidationException>(
                async () => await this.savedSearchService.RetrieveSavedSearchByIdAsync(nonExistentId));
        }

        [Fact]
        public void ShouldRetrieveAllSavedSearches()
        {
            // Arrange
            var expectedSavedSearches = new[]
            {
                new SavedSearch
                {
                    Id = Guid.NewGuid(),
                    UserId = Guid.NewGuid(),
                    Name = "Search 1",
                    City = "Tashkent",
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                },
                new SavedSearch
                {
                    Id = Guid.NewGuid(),
                    UserId = Guid.NewGuid(),
                    Name = "Search 2",
                    City = "Samarkand",
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                }
            };

            this.storageBrokerMock
                .Setup(broker => broker.SelectAllSavedSearches())
                .Returns(expectedSavedSearches.AsQueryable());

            // Act
            var actualSavedSearches = this.savedSearchService.RetrieveAllSavedSearches();

            // Assert
            actualSavedSearches.Should().BeEquivalentTo(expectedSavedSearches);
            this.storageBrokerMock.Verify(
                broker => broker.SelectAllSavedSearches(),
                Times.Once);
        }

        [Fact]
        public async Task ShouldUpdateSavedSearch()
        {
            // Arrange
            var savedSearchId = Guid.NewGuid();
            var existingSavedSearch = new SavedSearch
            {
                Id = savedSearchId,
                UserId = Guid.NewGuid(),
                Name = "Original Name",
                City = "Tashkent",
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            var updatedSavedSearch = new SavedSearch
            {
                Id = savedSearchId,
                UserId = existingSavedSearch.UserId,
                Name = "Updated Name",
                City = "Samarkand",
                CreatedAt = existingSavedSearch.CreatedAt,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            var expectedDateTime = DateTimeOffset.UtcNow;
            this.dateTimeBrokerMock
                .Setup(broker => broker.GetCurrentDateTimeOffset())
                .Returns(expectedDateTime);

            this.storageBrokerMock
                .Setup(broker => broker.UpdateSavedSearchAsync(It.IsAny<SavedSearch>()))
                .ReturnsAsync(updatedSavedSearch);

            // Act
            var actualSavedSearch = await this.savedSearchService.ModifySavedSearchAsync(updatedSavedSearch);

            // Assert
            actualSavedSearch.Should().BeEquivalentTo(updatedSavedSearch);
            updatedSavedSearch.UpdatedAt.Should().Be(expectedDateTime);

            this.storageBrokerMock.Verify(
                broker => broker.UpdateSavedSearchAsync(It.IsAny<SavedSearch>()),
                Times.Once);
        }

        [Fact]
        public async Task ShouldDeleteSavedSearch()
        {
            // Arrange
            var savedSearchId = Guid.NewGuid();
            var existingSavedSearch = new SavedSearch
            {
                Id = savedSearchId,
                UserId = Guid.NewGuid(),
                Name = "Test Search",
                City = "Tashkent",
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                DeletedAt = null
            };

            var expectedDateTime = DateTimeOffset.UtcNow;
            this.dateTimeBrokerMock
                .Setup(broker => broker.GetCurrentDateTimeOffset())
                .Returns(expectedDateTime);

            this.storageBrokerMock
                .Setup(broker => broker.SelectSavedSearchByIdAsync(savedSearchId))
                .ReturnsAsync(existingSavedSearch);

            this.storageBrokerMock
                .Setup(broker => broker.UpdateSavedSearchAsync(It.IsAny<SavedSearch>()))
                .ReturnsAsync(existingSavedSearch);

            // Act
            var deletedSavedSearch = await this.savedSearchService.RemoveSavedSearchByIdAsync(savedSearchId);

            // Assert
            deletedSavedSearch.DeletedAt.Should().Be(expectedDateTime);
            deletedSavedSearch.UpdatedAt.Should().Be(expectedDateTime);

            this.storageBrokerMock.Verify(
                broker => broker.SelectSavedSearchByIdAsync(savedSearchId),
                Times.Once);

            this.storageBrokerMock.Verify(
                broker => broker.UpdateSavedSearchAsync(It.Is<SavedSearch>(
                    s => s.DeletedAt == expectedDateTime && s.UpdatedAt == expectedDateTime)),
                Times.Once);
        }

        [Fact]
        public async Task ShouldThrowNotFoundExceptionWhenDeletingNonExistentSavedSearch()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();

            this.storageBrokerMock
                .Setup(broker => broker.SelectSavedSearchByIdAsync(nonExistentId))
                .ReturnsAsync((SavedSearch?)null);

            // Act & Assert
            await Assert.ThrowsAsync<SavedSearchDependencyValidationException>(
                async () => await this.savedSearchService.RemoveSavedSearchByIdAsync(nonExistentId));
        }
    }
}
