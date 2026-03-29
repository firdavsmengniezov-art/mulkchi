using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Messages;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Messages;

public partial class MessageServiceTests
{
    [Fact]
    public async Task ShouldRemoveMessageByIdAsync()
    {
        // given
        Message randomMessage = CreateRandomMessage();
        Message expectedMessage = randomMessage;

        // Set up CurrentUserService mock to return the message's sender ID
        this.currentUserServiceMock.Setup(x => x.GetCurrentUserId())
            .Returns(randomMessage.SenderId);
        this.currentUserServiceMock.Setup(x => x.IsInRole("Admin"))
            .Returns(false);

        // Mock the SelectMessageByIdAsync call that the authorization check makes
        this.storageBrokerMock.Setup(broker =>
            broker.SelectMessageByIdAsync(randomMessage.Id))
                .ReturnsAsync(randomMessage);

        this.storageBrokerMock.Setup(broker =>
            broker.DeleteMessageByIdAsync(randomMessage.Id))
                .ReturnsAsync(expectedMessage);

        // when
        Message actualMessage = await this.messageService.RemoveMessageByIdAsync(randomMessage.Id);

        // then
        actualMessage.Should().BeEquivalentTo(expectedMessage);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectMessageByIdAsync(randomMessage.Id),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.DeleteMessageByIdAsync(randomMessage.Id),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
