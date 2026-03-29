using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Discounts;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.DiscountUsages;

public partial class DiscountUsageServiceTests
{
    [Fact]
    public void ShouldRetrieveAllDiscountUsages()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        IQueryable<DiscountUsage> randomDiscountUsages = CreateRandomDiscountUsages();
        IQueryable<DiscountUsage> expectedDiscountUsages = randomDiscountUsages;

        this.storageBrokerMock.Setup(broker =>
            broker.SelectAllDiscountUsages())
                .Returns(expectedDiscountUsages);

        // when
        IQueryable<DiscountUsage> actualDiscountUsages = this.discountUsageService.RetrieveAllDiscountUsages();

        // then
        actualDiscountUsages.Should().BeEquivalentTo(expectedDiscountUsages);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectAllDiscountUsages(),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    private IQueryable<DiscountUsage> CreateRandomDiscountUsages()
    {
        return Enumerable.Range(0, 5)
            .Select(_ => CreateRandomDiscountUsage())
            .AsQueryable();
    }
}
