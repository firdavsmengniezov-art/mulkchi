using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Properties;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Properties;

public partial class PropertyServiceTests
{
    [Fact]
    public async Task ShouldAddPropertyAsync()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        Property randomProperty = CreateValidProperty();
        Property inputProperty = randomProperty;
        inputProperty.CreatedDate = randomDateTimeOffset;
        inputProperty.UpdatedDate = randomDateTimeOffset;
        Property expectedProperty = inputProperty;

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(randomDateTimeOffset);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertPropertyAsync(inputProperty))
                .ReturnsAsync(expectedProperty);

        // when
        Property actualProperty = await this.propertyService.AddPropertyAsync(inputProperty);

        // then
        actualProperty.Should().BeEquivalentTo(expectedProperty);

        this.dateTimeBrokerMock.Verify(broker =>
            broker.GetCurrentDateTimeOffset(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertPropertyAsync(inputProperty),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
