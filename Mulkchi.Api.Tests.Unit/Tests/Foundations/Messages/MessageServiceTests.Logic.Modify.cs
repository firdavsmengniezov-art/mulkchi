using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Messages;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Messages;

public partial class MessageServiceTests
{
    [Fact]
    public async Task ShouldModifyMessageAsync()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        Message randomMessage = CreateRandomMessage();
        Message inputMessage = randomMessage;
        inputMessage.UpdatedDate = randomDateTimeOffset;
        Message expectedMessage = inputMessage;

        // Set up CurrentUserService mock to return the message's sender ID
        this.currentUserServiceMock.Setup(x => x.GetCurrentUserId())
            .Returns(inputMessage.SenderId);
        this.currentUserServiceMock.Setup(x => x.IsInRole("Admin"))
            .Returns(false);

        // Mock the SelectMessageByIdAsync call that the authorization check makes
        this.storageBrokerMock.Setup(broker =>
            broker.SelectMessageByIdAsync(inputMessage.Id))
                .ReturnsAsync(randomMessage);

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(randomDateTimeOffset);

        this.storageBrokerMock.Setup(broker =>
            broker.UpdateMessageAsync(inputMessage))
                .ReturnsAsync(expectedMessage);

        // when
        Message actualMessage = await this.messageService.ModifyMessageAsync(inputMessage);

        // then
        actualMessage.Should().BeEquivalentTo(expectedMessage);

        this.dateTimeBrokerMock.Verify(broker =>
            broker.GetCurrentDateTimeOffset(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectMessageByIdAsync(inputMessage.Id),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.UpdateMessageAsync(inputMessage),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
