using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.AIs;
using Mulkchi.Api.Models.Foundations.Favorites;
using Mulkchi.Api.Models.Foundations.PropertyImages;
using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.PropertyViews;
using Mulkchi.Api.Services.Foundations.AiRecommendations;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.AiRecommendations;

public partial class AiRecommendationServiceTests
{
    [Fact]
    public async Task ShouldRetrieveHybridRecommendationsAsync()
    {
        // given
        Guid userId = Guid.NewGuid();
        Property nearProperty = CreateProperty(
            id: Guid.NewGuid(),
            title: "Near property",
            latitude: 41.2995,
            longitude: 69.2401,
            price: 1000m);

        Property farProperty = CreateProperty(
            id: Guid.NewGuid(),
            title: "Far property",
            latitude: 39.6542,
            longitude: 66.9597,
            price: 850m);

        List<Property> randomProperties = [nearProperty, farProperty];

        List<PropertyImage> randomPropertyImages =
        [
            new PropertyImage
            {
                Id = Guid.NewGuid(),
                PropertyId = nearProperty.Id,
                Url = "https://example.com/near.jpg",
                Caption = "Near",
                SortOrder = 0,
                IsPrimary = true,
                CreatedDate = DateTimeOffset.UtcNow,
                UpdatedDate = DateTimeOffset.UtcNow
            },
            new PropertyImage
            {
                Id = Guid.NewGuid(),
                PropertyId = farProperty.Id,
                Url = "https://example.com/far.jpg",
                Caption = "Far",
                SortOrder = 0,
                IsPrimary = true,
                CreatedDate = DateTimeOffset.UtcNow,
                UpdatedDate = DateTimeOffset.UtcNow
            }
        ];

        DateTimeOffset now = DateTimeOffset.UtcNow;

        this.dateTimeBrokerMock.Setup(broker => broker.GetCurrentDateTimeOffset())
            .Returns(now);

        this.storageBrokerMock.Setup(broker => broker.SelectAllProperties())
            .Returns(randomProperties.AsQueryable());

        this.storageBrokerMock.Setup(broker => broker.SelectAllPropertyImages())
            .Returns(randomPropertyImages.AsQueryable());

        this.storageBrokerMock.Setup(broker => broker.SelectAllFavorites())
            .Returns(Enumerable.Empty<Favorite>().AsQueryable());

        this.storageBrokerMock.Setup(broker => broker.SelectAllPropertyViews())
            .Returns(Enumerable.Empty<PropertyView>().AsQueryable());

        HybridRecommendationRequest request = new()
        {
            UserId = userId,
            Latitude = 41.2995,
            Longitude = 69.2401,
            RadiusKm = 10,
            Limit = 2
        };

        // when
        IEnumerable<HybridRecommendationResponse> actualRecommendations =
            await ((AiRecommendationService)this.aiRecommendationService).RetrieveHybridRecommendationsAsync(request);

        List<HybridRecommendationResponse> recommendationList = actualRecommendations.ToList();

        // then
        recommendationList.Should().HaveCount(2);
        recommendationList[0].PropertyId.Should().Be(nearProperty.Id);
        recommendationList[0].Property.DistanceKm.Should().HaveValue();
        recommendationList[0].Property.DistanceKm!.Value.Should().BeApproximately(0, 0.01);
        recommendationList[0].Score.Should().BeGreaterThan(recommendationList[1].Score);
        recommendationList[0].CreatedAt.Should().Be(now);
        recommendationList[1].Property.DistanceKm.Should().HaveValue();
        recommendationList[1].Property.DistanceKm!.Value.Should().BeGreaterThan(100);

        this.storageBrokerMock.Verify(broker => broker.SelectAllProperties(), Times.Once);
        this.storageBrokerMock.Verify(broker => broker.SelectAllPropertyImages(), Times.Once);
        this.storageBrokerMock.Verify(broker => broker.SelectAllFavorites(), Times.Exactly(2));
        this.storageBrokerMock.Verify(broker => broker.SelectAllPropertyViews(), Times.Once);
        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    private static Property CreateProperty(
        Guid id,
        string title,
        double latitude,
        double longitude,
        decimal price)
    {
        return new Property
        {
            Id = id,
            Title = title,
            Description = "Test property description",
            Type = PropertyType.Apartment,
            Category = PropertyCategory.Residential,
            Status = PropertyStatus.Active,
            ListingType = ListingType.Rent,
            MonthlyRent = price,
            SalePrice = null,
            PricePerNight = null,
            SecurityDeposit = null,
            Area = 80,
            NumberOfBedrooms = 2,
            NumberOfBathrooms = 1,
            MaxGuests = 4,
            Region = UzbekistanRegion.ToshkentShahar,
            City = "Toshkent",
            District = "Chilonzor",
            Address = "Test address",
            Mahalla = "Test mahalla",
            Latitude = latitude,
            Longitude = longitude,
            HasWifi = true,
            HasParking = true,
            HasPool = false,
            PetsAllowed = false,
            IsInstantBook = true,
            IsVacant = true,
            IsFeatured = false,
            IsVerified = true,
            HasMetroNearby = true,
            HasBusStop = true,
            HasMarketNearby = true,
            HasSchoolNearby = true,
            HasHospitalNearby = true,
            DistanceToCityCenter = 3,
            HasElevator = true,
            HasSecurity = false,
            HasGenerator = false,
            HasGas = true,
            HasFurniture = true,
            IsRenovated = true,
            HasAirConditioning = true,
            HasHeating = true,
            HasWasher = true,
            HasKitchen = true,
            HasTV = true,
            HasWorkspace = false,
            IsSelfCheckIn = false,
            IsChildFriendly = true,
            IsAccessible = false,
            AverageRating = 4.8m,
            ViewsCount = 10,
            FavoritesCount = 3,
            HostId = Guid.NewGuid(),
            Currency = Currency.UZS,
            ExchangeRate = 1,
            CreatedDate = DateTimeOffset.UtcNow,
            UpdatedDate = DateTimeOffset.UtcNow,
            DeletedDate = null
        };
    }
}