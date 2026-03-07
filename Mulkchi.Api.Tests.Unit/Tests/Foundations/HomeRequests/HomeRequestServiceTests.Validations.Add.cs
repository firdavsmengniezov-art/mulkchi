using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.HomeRequests;
using Mulkchi.Api.Models.Foundations.HomeRequests.Exceptions;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.HomeRequests;

public partial class HomeRequestServiceTests
{
    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenNullHomeRequest()
    {
        // given
        HomeRequest? inputHomeRequest = null;

        // when
        ValueTask<HomeRequest> addHomeRequestTask =
            this.homeRequestService.AddHomeRequestAsync(inputHomeRequest!);

        // then
        HomeRequestValidationException actualException =
            await Assert.ThrowsAsync<HomeRequestValidationException>(
                testCode: async () => await addHomeRequestTask);

        actualException.InnerException.Should().BeOfType<NullHomeRequestException>();

        this.storageBrokerMock.Verify(broker =>
            broker.InsertHomeRequestAsync(It.IsAny<HomeRequest>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenIdIsEmpty()
    {
        // given
        HomeRequest randomHomeRequest = CreateRandomHomeRequest();
        randomHomeRequest.Id = Guid.Empty;

        // when
        ValueTask<HomeRequest> addHomeRequestTask =
            this.homeRequestService.AddHomeRequestAsync(randomHomeRequest);

        // then
        await Assert.ThrowsAsync<HomeRequestValidationException>(
            testCode: async () => await addHomeRequestTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertHomeRequestAsync(It.IsAny<HomeRequest>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenGuestIdIsEmpty()
    {
        // given
        HomeRequest randomHomeRequest = CreateRandomHomeRequest();
        randomHomeRequest.GuestId = Guid.Empty;

        // when
        ValueTask<HomeRequest> addHomeRequestTask =
            this.homeRequestService.AddHomeRequestAsync(randomHomeRequest);

        // then
        await Assert.ThrowsAsync<HomeRequestValidationException>(
            testCode: async () => await addHomeRequestTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertHomeRequestAsync(It.IsAny<HomeRequest>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenHostIdIsEmpty()
    {
        // given
        HomeRequest randomHomeRequest = CreateRandomHomeRequest();
        randomHomeRequest.HostId = Guid.Empty;

        // when
        ValueTask<HomeRequest> addHomeRequestTask =
            this.homeRequestService.AddHomeRequestAsync(randomHomeRequest);

        // then
        await Assert.ThrowsAsync<HomeRequestValidationException>(
            testCode: async () => await addHomeRequestTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertHomeRequestAsync(It.IsAny<HomeRequest>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenPropertyIdIsEmpty()
    {
        // given
        HomeRequest randomHomeRequest = CreateRandomHomeRequest();
        randomHomeRequest.PropertyId = Guid.Empty;

        // when
        ValueTask<HomeRequest> addHomeRequestTask =
            this.homeRequestService.AddHomeRequestAsync(randomHomeRequest);

        // then
        await Assert.ThrowsAsync<HomeRequestValidationException>(
            testCode: async () => await addHomeRequestTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertHomeRequestAsync(It.IsAny<HomeRequest>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
