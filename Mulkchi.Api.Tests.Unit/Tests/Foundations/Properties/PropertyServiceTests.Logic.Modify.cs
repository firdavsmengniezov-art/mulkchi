using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Properties;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Properties;

public partial class PropertyServiceTests
{
    [Fact]
    public async Task ShouldModifyPropertyAsync()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        Property randomProperty = CreateValidProperty();
        randomProperty.Id = Guid.NewGuid(); // For modify, we need a valid ID
        Property inputProperty = randomProperty;
        inputProperty.UpdatedDate = randomDateTimeOffset;
        Property expectedProperty = inputProperty;

        // Set up CurrentUserService mock to return the property's host ID
        this.currentUserServiceMock.Setup(x => x.GetCurrentUserId())
            .Returns(inputProperty.HostId);
        this.currentUserServiceMock.Setup(x => x.IsInRole("Admin"))
            .Returns(false);

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(randomDateTimeOffset);

        this.storageBrokerMock.Setup(broker =>
            broker.UpdatePropertyAsync(inputProperty))
                .ReturnsAsync(expectedProperty);

        // when
        Property actualProperty = await this.propertyService.ModifyPropertyAsync(inputProperty);

        // then
        actualProperty.Should().BeEquivalentTo(expectedProperty);

        this.dateTimeBrokerMock.Verify(broker =>
            broker.GetCurrentDateTimeOffset(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.UpdatePropertyAsync(inputProperty),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
