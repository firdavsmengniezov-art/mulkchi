using FluentAssertions;
using Microsoft.Data.SqlClient;
using Moq;
using Mulkchi.Api.Models.Foundations.Discounts;
using Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.DiscountUsages;

public partial class DiscountUsageServiceTests
{
    [Fact]
    public async Task ShouldThrowDependencyException_OnAdd_WhenSqlExceptionOccurs()
    {
        // given
        DiscountUsage someDiscountUsage = CreateRandomDiscountUsage();
        SqlException sqlException = CreateSqlException();

        this.storageBrokerMock.Setup(broker =>
            broker.InsertDiscountUsageAsync(It.IsAny<DiscountUsage>()))
                .ThrowsAsync(sqlException);

        // when
        Func<Task> addDiscountUsageTask = async () =>
            await this.discountUsageService.AddDiscountUsageAsync(someDiscountUsage);

        // then
        DiscountUsageDependencyException actualException =
            await Assert.ThrowsAsync<DiscountUsageDependencyException>(
                testCode: async () => await addDiscountUsageTask());

        actualException.InnerException.Should().BeOfType<FailedDiscountUsageStorageException>();

        this.storageBrokerMock.Verify(broker =>
            broker.InsertDiscountUsageAsync(It.IsAny<DiscountUsage>()),
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
        DiscountUsage someDiscountUsage = CreateRandomDiscountUsage();
        var exception = new Exception();

        this.storageBrokerMock.Setup(broker =>
            broker.InsertDiscountUsageAsync(It.IsAny<DiscountUsage>()))
                .ThrowsAsync(exception);

        // when
        Func<Task> addDiscountUsageTask = async () =>
            await this.discountUsageService.AddDiscountUsageAsync(someDiscountUsage);

        // then
        DiscountUsageServiceException actualException =
            await Assert.ThrowsAsync<DiscountUsageServiceException>(
                testCode: async () => await addDiscountUsageTask());

        actualException.InnerException.Should().BeOfType<FailedDiscountUsageServiceException>();

        this.storageBrokerMock.Verify(broker =>
            broker.InsertDiscountUsageAsync(It.IsAny<DiscountUsage>()),
            Times.Once);

        this.loggingBrokerMock.Verify(broker =>
            broker.LogError(It.IsAny<Exception>()),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
        this.loggingBrokerMock.VerifyNoOtherCalls();
    }
}
