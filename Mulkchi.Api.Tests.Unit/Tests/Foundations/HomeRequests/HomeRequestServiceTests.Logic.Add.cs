using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.HomeRequests;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.HomeRequests;

public partial class HomeRequestServiceTests
{
    [Fact]
    public async Task ShouldAddHomeRequestAsync()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        HomeRequest randomHomeRequest = CreateRandomHomeRequest();
        HomeRequest inputHomeRequest = randomHomeRequest;
        inputHomeRequest.CreatedDate = randomDateTimeOffset;
        inputHomeRequest.UpdatedDate = randomDateTimeOffset;
        HomeRequest expectedHomeRequest = inputHomeRequest;

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(randomDateTimeOffset);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertHomeRequestAsync(inputHomeRequest))
                .ReturnsAsync(expectedHomeRequest);

        // when
        HomeRequest actualHomeRequest = await this.homeRequestService.AddHomeRequestAsync(inputHomeRequest);

        // then
        actualHomeRequest.Should().BeEquivalentTo(expectedHomeRequest);

        this.dateTimeBrokerMock.Verify(broker =>
            broker.GetCurrentDateTimeOffset(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertHomeRequestAsync(inputHomeRequest),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
