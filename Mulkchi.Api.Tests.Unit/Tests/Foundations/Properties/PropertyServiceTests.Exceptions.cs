using System;
using System.Data.SqlClient;
using System.Runtime.Serialization;
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
    public async Task AddPropertyAsync_SqlException_ThrowsDependencyException()
    {
        // Arrange
        Property someProperty = CreateRandomProperty();
        SqlException sqlException = CreateSqlException();

        var expectedDependencyException =
            new PropertyDependencyException(sqlException);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertPropertyAsync(It.IsAny<Property>()))
                .ThrowsAsync(sqlException);

        // Act & Assert
        await Assert.ThrowsAsync<PropertyDependencyException>(() =>
            this.propertyService.AddPropertyAsync(someProperty));

        this.loggingBrokerMock.Verify(broker =>
            broker.LogCritical(It.IsAny<PropertyDependencyException>()),
            Times.Once);
    }

    [Fact]
    public async Task AddPropertyAsync_DuplicateKey_ThrowsDependencyValidationException()
    {
        // Arrange
        Property someProperty = CreateRandomProperty();
        var duplicateKeyException = new DuplicateKeyException("Duplicate property");

        this.storageBrokerMock.Setup(broker =>
            broker.InsertPropertyAsync(It.IsAny<Property>()))
                .ThrowsAsync(duplicateKeyException);

        // Act & Assert
        await Assert.ThrowsAsync<PropertyDependencyValidationException>(() =>
            this.propertyService.AddPropertyAsync(someProperty));
    }

    [Fact]
    public async Task RetrievePropertyByIdAsync_NotFound_ThrowsValidationException()
    {
        // Arrange
        Guid propertyId = Guid.NewGuid();
        Property nullProperty = null;

        this.storageBrokerMock.Setup(broker =>
            broker.SelectPropertyByIdAsync(propertyId))
                .ReturnsAsync(nullProperty);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundPropertyException>(() =>
            this.propertyService.RetrievePropertyByIdAsync(propertyId));
    }

    [Fact]
    public async Task ModifyPropertyAsync_NullProperty_ThrowsValidationException()
    {
        // Arrange
        Property nullProperty = null;

        // Act & Assert
        await Assert.ThrowsAsync<PropertyValidationException>(() =>
            this.propertyService.ModifyPropertyAsync(nullProperty));

        this.storageBrokerMock.Verify(broker =>
            broker.UpdatePropertyAsync(It.IsAny<Property>()),
            Times.Never);
    }

    [Fact]
    public async Task RemovePropertyAsync_NotFound_ThrowsValidationException()
    {
        // Arrange
        Guid propertyId = Guid.NewGuid();
        Property nullProperty = null;

        this.storageBrokerMock.Setup(broker =>
            broker.SelectPropertyByIdAsync(propertyId))
                .ReturnsAsync(nullProperty);

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundPropertyException>(() =>
            this.propertyService.RemovePropertyAsync(propertyId));
    }

    // SQL exception yaratish helper
    private static SqlException CreateSqlException() =>
        (SqlException)FormatterServices.GetUninitializedObject(
            typeof(SqlException));
}
