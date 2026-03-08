using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.RentalContracts;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.RentalContracts;

public partial class RentalContractServiceTests
{
    [Fact]
    public async Task ShouldAddRentalContractAsync()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        RentalContract randomRentalContract = CreateRandomRentalContract();
        RentalContract inputRentalContract = randomRentalContract;
        inputRentalContract.CreatedDate = randomDateTimeOffset;
        inputRentalContract.UpdatedDate = randomDateTimeOffset;
        RentalContract expectedRentalContract = inputRentalContract;

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(randomDateTimeOffset);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertRentalContractAsync(inputRentalContract))
                .ReturnsAsync(expectedRentalContract);

        // when
        RentalContract actualRentalContract = await this.rentalContractService.AddRentalContractAsync(inputRentalContract);

        // then
        actualRentalContract.Should().BeEquivalentTo(expectedRentalContract);

        this.dateTimeBrokerMock.Verify(broker =>
            broker.GetCurrentDateTimeOffset(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertRentalContractAsync(inputRentalContract),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
