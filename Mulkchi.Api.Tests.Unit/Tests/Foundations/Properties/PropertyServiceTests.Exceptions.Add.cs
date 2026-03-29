using FluentAssertions;
using Microsoft.Data.SqlClient;
using Moq;
using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.Properties.Exceptions;
using Xeptions;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Properties;

public partial class PropertyServiceTests
{
    [Fact]
    public async Task ShouldThrowDependencyException_OnAdd_WhenSqlExceptionOccurs()
    {
        // given
        Property someProperty = CreateValidProperty();
        SqlException sqlException = CreateSqlException();

        this.storageBrokerMock.Setup(broker =>
            broker.InsertPropertyAsync(It.IsAny<Property>()))
                .ThrowsAsync(sqlException);

        // when
        Func<Task> addPropertyTask = async () =>
            await this.propertyService.AddPropertyAsync(someProperty);

        // then
        PropertyDependencyException actualException =
            await Assert.ThrowsAsync<PropertyDependencyException>(
                testCode: async () => await addPropertyTask());

        actualException.InnerException.Should().BeOfType<FailedPropertyStorageException>();

        this.storageBrokerMock.Verify(broker =>
            broker.InsertPropertyAsync(It.IsAny<Property>()),
            Times.Once);

        this.loggingBrokerMock.Verify(broker =>
            broker.LogError(It.IsAny<Exception>()),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
        this.loggingBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowServiceException_OnAdd_WhenExceptionOccurs()
    {
        // given
        Property someProperty = CreateRandomProperty();
        var exception = new Exception();

        this.storageBrokerMock.Setup(broker =>
            broker.InsertPropertyAsync(It.IsAny<Property>()))
                .ThrowsAsync(exception);

        // when
        Func<Task> addPropertyTask = async () =>
            await this.propertyService.AddPropertyAsync(someProperty);

        // then
        PropertyServiceException actualException =
            await Assert.ThrowsAsync<PropertyServiceException>(
                testCode: async () => await addPropertyTask());

        actualException.InnerException.Should().BeOfType<FailedPropertyServiceException>();

        this.storageBrokerMock.Verify(broker =>
            broker.InsertPropertyAsync(It.IsAny<Property>()),
            Times.Once);

        this.loggingBrokerMock.Verify(broker =>
            broker.LogError(It.IsAny<Exception>()),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
        this.loggingBrokerMock.VerifyNoOtherCalls();
    }
}
