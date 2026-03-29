using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Discounts;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.DiscountUsages;

public partial class DiscountUsageServiceTests
{
    [Fact]
    public async Task ShouldRetrieveDiscountUsageByIdAsync()
    {
        // given
        Guid randomDiscountUsageId = Guid.NewGuid();
        DiscountUsage randomDiscountUsage = CreateRandomDiscountUsage();
        DiscountUsage expectedDiscountUsage = randomDiscountUsage;
        expectedDiscountUsage.Id = randomDiscountUsageId;

        this.storageBrokerMock.Setup(broker =>
            broker.SelectDiscountUsageByIdAsync(randomDiscountUsageId))
                .ReturnsAsync(expectedDiscountUsage);

        // when
        DiscountUsage actualDiscountUsage = await this.discountUsageService.RetrieveDiscountUsageByIdAsync(randomDiscountUsageId);

        // then
        actualDiscountUsage.Should().BeEquivalentTo(expectedDiscountUsage);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectDiscountUsageByIdAsync(randomDiscountUsageId),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
