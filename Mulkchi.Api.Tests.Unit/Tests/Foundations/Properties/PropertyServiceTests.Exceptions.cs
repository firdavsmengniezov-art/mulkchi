using System;
using Microsoft.Data.SqlClient;
using System.Runtime.Serialization;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.Properties.Exceptions;
using Xunit;
using Xeptions;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Properties;

public partial class PropertyServiceTests
{
    [Fact]
    public async Task AddPropertyAsync_SqlException_ThrowsDependencyException()
    {
        // Arrange
        Property someProperty = CreateValidProperty();
        SqlException sqlException = CreateSqlException();

        var expectedDependencyException =
            new PropertyDependencyException("Database error occurred", new Xeption(sqlException.Message));

        this.storageBrokerMock.Setup(broker =>
            broker.InsertPropertyAsync(It.IsAny<Property>()))
                .ThrowsAsync(sqlException);

        // Act & Assert
        Func<Task> addPropertyTask = async () =>
            await this.propertyService.AddPropertyAsync(someProperty);

        await Assert.ThrowsAsync<PropertyDependencyException>(addPropertyTask);

        this.loggingBrokerMock.Verify(broker =>
            broker.LogError(It.IsAny<PropertyDependencyException>()),
            Times.Once);
    }

    private static Property CreateValidProperty()
    {
        return new Property
        {
            Id = Guid.Empty,
            Title = "Test Property",
            Description = "Test Description",
            City = "Tashkent",
            Address = "Test Address",
            Area = 100.0,
            MonthlyRent = 1000,
            ListingType = ListingType.Rent,
            Type = PropertyType.Apartment,
            Category = PropertyCategory.Residential,
            Status = PropertyStatus.Active,
            NumberOfBedrooms = 2,
            NumberOfBathrooms = 1,
            MaxGuests = 4,
            Region = UzbekistanRegion.ToshkentShahar,
            District = "Test District",
            Mahalla = "Test Mahalla",
            HostId = Guid.NewGuid()
        };
    }

    [Fact]
    public async Task AddPropertyAsync_DuplicateKey_ThrowsDependencyValidationException()
    {
        // Arrange
        Property someProperty = CreateValidProperty();
        var duplicateKeyException = new Exception("Duplicate property");

        this.storageBrokerMock.Setup(broker =>
            broker.InsertPropertyAsync(It.IsAny<Property>()))
                .ThrowsAsync(duplicateKeyException);

        // Act & Assert
        Func<Task> addPropertyTask = async () =>
            await this.propertyService.AddPropertyAsync(someProperty);

        await Assert.ThrowsAsync<PropertyServiceException>(addPropertyTask);
    }

    [Fact]
    public async Task RetrievePropertyByIdAsync_NotFound_ThrowsValidationException()
    {
        // Arrange
        Guid propertyId = Guid.NewGuid();
        Property? nullProperty = null;

        this.storageBrokerMock.Setup(broker =>
            broker.SelectPropertyByIdAsync(propertyId))
                .ReturnsAsync(nullProperty!);

        // Act & Assert
        Func<Task> retrievePropertyTask = async () =>
            await this.propertyService.RetrievePropertyByIdAsync(propertyId);

        await Assert.ThrowsAsync<NotFoundPropertyException>(retrievePropertyTask);
    }

    [Fact]
    public async Task ModifyPropertyAsync_NullProperty_ThrowsValidationException()
    {
        // Arrange
        Property? nullProperty = null;

        // Act & Assert
        Func<Task> modifyPropertyTask = async () =>
            await this.propertyService.ModifyPropertyAsync(nullProperty);

        await Assert.ThrowsAsync<PropertyValidationException>(modifyPropertyTask);

        this.storageBrokerMock.Verify(broker =>
            broker.UpdatePropertyAsync(It.IsAny<Property>()),
            Times.Never);
    }

    [Fact]
    public async Task RemovePropertyAsync_NotFound_ThrowsValidationException()
    {
        // Arrange
        Guid propertyId = Guid.NewGuid();
        Property? nullProperty = null;

        this.storageBrokerMock.Setup(broker =>
            broker.SelectPropertyByIdAsync(propertyId))
                .ReturnsAsync(nullProperty!);

        // Act & Assert
        Func<Task> removePropertyTask = async () =>
            await this.propertyService.RemovePropertyByIdAsync(propertyId);

        await Assert.ThrowsAsync<NotFoundPropertyException>(removePropertyTask);
    }
}
