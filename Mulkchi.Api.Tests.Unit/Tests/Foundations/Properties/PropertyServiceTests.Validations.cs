using System;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.Properties.Exceptions;
using Xunit;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Properties;

public partial class PropertyServiceTests
{
    [Fact]
    public async Task AddPropertyAsync_NullProperty_ThrowsValidationException()
    {
        // Arrange
        Property nullProperty = null;

        // Act & Assert
        await Assert.ThrowsAsync<PropertyValidationException>(() =>
            this.propertyService.AddPropertyAsync(nullProperty));

        this.storageBrokerMock.Verify(broker =>
            broker.InsertPropertyAsync(It.IsAny<Property>()),
            Times.Never);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task AddPropertyAsync_InvalidTitle_ThrowsValidationException(
        string invalidTitle)
    {
        // Arrange
        Property property = CreateRandomProperty();
        property.Title = invalidTitle;

        // Act & Assert
        await Assert.ThrowsAsync<PropertyValidationException>(() =>
            this.propertyService.AddPropertyAsync(property));
    }

    [Fact]
    public async Task AddPropertyAsync_ValidProperty_ReturnsProperty()
    {
        // Arrange
        Property randomProperty = CreateRandomProperty();
        Property inputProperty = randomProperty;
        Property persistedProperty = randomProperty;

        this.storageBrokerMock.Setup(broker =>
            broker.InsertPropertyAsync(inputProperty))
                .ReturnsAsync(persistedProperty);

        // Act
        Property actualProperty =
            await this.propertyService.AddPropertyAsync(inputProperty);

        // Assert
        actualProperty.Should().BeEquivalentTo(persistedProperty);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertPropertyAsync(inputProperty), Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(0)]
    public async Task AddPropertyAsync_InvalidArea_ThrowsValidationException(
        decimal invalidArea)
    {
        // Arrange
        Property property = CreateRandomProperty();
        property.Area = invalidArea;

        // Act & Assert
        await Assert.ThrowsAsync<PropertyValidationException>(() =>
            this.propertyService.AddPropertyAsync(property));
    }

    [Theory]
    [InlineData(-100)]
    [InlineData(0)]
    public async Task AddPropertyAsync_InvalidMonthlyRent_ThrowsValidationException(
        decimal invalidRent)
    {
        // Arrange
        Property property = CreateRandomProperty();
        property.MonthlyRent = invalidRent;

        // Act & Assert
        await Assert.ThrowsAsync<PropertyValidationException>(() =>
            this.propertyService.AddPropertyAsync(property));
    }

    [Fact]
    public async Task AddPropertyAsync_InvalidListingType_ThrowsValidationException()
    {
        // Arrange
        Property property = CreateRandomProperty();
        property.ListingType = (ListingType)999; // Invalid enum value

        // Act & Assert
        await Assert.ThrowsAsync<PropertyValidationException>(() =>
            this.propertyService.AddPropertyAsync(property));
    }
}
