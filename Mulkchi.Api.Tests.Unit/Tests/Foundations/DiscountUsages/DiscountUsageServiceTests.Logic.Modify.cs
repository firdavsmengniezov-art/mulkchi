using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Discounts;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.DiscountUsages;

public partial class DiscountUsageServiceTests
{
    [Fact]
    public async Task ShouldModifyDiscountUsageAsync()
    {
        // given
        DiscountUsage randomDiscountUsage = CreateRandomDiscountUsage();
        DiscountUsage inputDiscountUsage = randomDiscountUsage;
        DiscountUsage expectedDiscountUsage = inputDiscountUsage;

        this.storageBrokerMock.Setup(broker =>
            broker.UpdateDiscountUsageAsync(inputDiscountUsage))
                .ReturnsAsync(expectedDiscountUsage);

        // when
        DiscountUsage actualDiscountUsage = await this.discountUsageService.ModifyDiscountUsageAsync(inputDiscountUsage);

        // then
        actualDiscountUsage.Should().BeEquivalentTo(expectedDiscountUsage);

        this.storageBrokerMock.Verify(broker =>
            broker.UpdateDiscountUsageAsync(inputDiscountUsage),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
        this.dateTimeBrokerMock.VerifyNoOtherCalls();
        this.loggingBrokerMock.VerifyNoOtherCalls();
    }
}
