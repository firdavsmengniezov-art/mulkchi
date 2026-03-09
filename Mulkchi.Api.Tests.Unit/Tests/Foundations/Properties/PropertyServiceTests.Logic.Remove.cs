using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Properties;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Properties;

public partial class PropertyServiceTests
{
    [Fact]
    public async Task ShouldRemovePropertyByIdAsync()
    {
        // given
        Property randomProperty = CreateRandomProperty();
        Property expectedProperty = randomProperty;

        // Set up CurrentUserService mock to return the property's host ID
        this.currentUserServiceMock.Setup(x => x.GetCurrentUserId())
            .Returns(randomProperty.HostId);
        this.currentUserServiceMock.Setup(x => x.IsInRole("Admin"))
            .Returns(false);

        // Mock the SelectPropertyByIdAsync call that the authorization check makes
        this.storageBrokerMock.Setup(broker =>
            broker.SelectPropertyByIdAsync(randomProperty.Id))
                .ReturnsAsync(randomProperty);

        this.storageBrokerMock.Setup(broker =>
            broker.DeletePropertyByIdAsync(randomProperty.Id))
                .ReturnsAsync(expectedProperty);

        // when
        Property actualProperty = await this.propertyService.RemovePropertyByIdAsync(randomProperty.Id);

        // then
        actualProperty.Should().BeEquivalentTo(expectedProperty);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectPropertyByIdAsync(randomProperty.Id),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.DeletePropertyByIdAsync(randomProperty.Id),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
