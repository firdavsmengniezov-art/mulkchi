using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Discounts;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.DiscountUsages;

public partial class DiscountUsageServiceTests
{
    [Fact]
    public async Task ShouldRemoveDiscountUsageAsync()
    {
        // given
        Guid randomDiscountUsageId = Guid.NewGuid();
        DiscountUsage randomDiscountUsage = CreateRandomDiscountUsage();
        DiscountUsage storageDiscountUsage = randomDiscountUsage;
        storageDiscountUsage.Id = randomDiscountUsageId;
        DiscountUsage expectedDiscountUsage = storageDiscountUsage;

        this.storageBrokerMock.Setup(broker =>
            broker.DeleteDiscountUsageByIdAsync(randomDiscountUsageId))
                .ReturnsAsync(expectedDiscountUsage);

        // when
        DiscountUsage actualDiscountUsage = await this.discountUsageService.RemoveDiscountUsageByIdAsync(randomDiscountUsageId);

        // then
        actualDiscountUsage.Should().BeEquivalentTo(expectedDiscountUsage);

        this.storageBrokerMock.Verify(broker =>
            broker.DeleteDiscountUsageByIdAsync(randomDiscountUsageId),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
        this.dateTimeBrokerMock.VerifyNoOtherCalls();
        this.loggingBrokerMock.VerifyNoOtherCalls();
    }
}
