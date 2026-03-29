using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Discounts;
using Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.DiscountUsages;

public partial class DiscountUsageServiceTests
{
    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenNullDiscountUsage()
    {
        // given
        DiscountUsage? inputDiscountUsage = null;

        // when
        ValueTask<DiscountUsage> addDiscountUsageTask =
            this.discountUsageService.AddDiscountUsageAsync(inputDiscountUsage!);

        // then
        DiscountUsageValidationException actualException =
            await Assert.ThrowsAsync<DiscountUsageValidationException>(
                testCode: async () => await addDiscountUsageTask);

        actualException.InnerException.Should().BeOfType<NullDiscountUsageException>();

        this.storageBrokerMock.Verify(broker =>
            broker.InsertDiscountUsageAsync(It.IsAny<DiscountUsage>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenDiscountIdIsEmpty()
    {
        // given
        DiscountUsage randomDiscountUsage = CreateRandomDiscountUsage();
        randomDiscountUsage.DiscountId = Guid.Empty;

        // when
        ValueTask<DiscountUsage> addDiscountUsageTask =
            this.discountUsageService.AddDiscountUsageAsync(randomDiscountUsage);

        // then
        await Assert.ThrowsAsync<DiscountUsageValidationException>(
            testCode: async () => await addDiscountUsageTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertDiscountUsageAsync(It.IsAny<DiscountUsage>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenUserIdIsEmpty()
    {
        // given
        DiscountUsage randomDiscountUsage = CreateRandomDiscountUsage();
        randomDiscountUsage.UserId = Guid.Empty;

        // when
        ValueTask<DiscountUsage> addDiscountUsageTask =
            this.discountUsageService.AddDiscountUsageAsync(randomDiscountUsage);

        // then
        await Assert.ThrowsAsync<DiscountUsageValidationException>(
            testCode: async () => await addDiscountUsageTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertDiscountUsageAsync(It.IsAny<DiscountUsage>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
