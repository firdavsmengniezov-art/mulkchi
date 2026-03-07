using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Messages;
using Mulkchi.Api.Models.Foundations.Messages.Exceptions;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Messages;

public partial class MessageServiceTests
{
    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenNullMessage()
    {
        // given
        Message? inputMessage = null;

        // when
        ValueTask<Message> addMessageTask =
            this.messageService.AddMessageAsync(inputMessage!);

        // then
        MessageValidationException actualException =
            await Assert.ThrowsAsync<MessageValidationException>(
                testCode: async () => await addMessageTask);

        actualException.InnerException.Should().BeOfType<NullMessageException>();

        this.storageBrokerMock.Verify(broker =>
            broker.InsertMessageAsync(It.IsAny<Message>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenIdIsEmpty()
    {
        // given
        Message randomMessage = CreateRandomMessage();
        randomMessage.Id = Guid.Empty;

        // when
        ValueTask<Message> addMessageTask =
            this.messageService.AddMessageAsync(randomMessage);

        // then
        await Assert.ThrowsAsync<MessageValidationException>(
            testCode: async () => await addMessageTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertMessageAsync(It.IsAny<Message>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenSenderIdIsEmpty()
    {
        // given
        Message randomMessage = CreateRandomMessage();
        randomMessage.SenderId = Guid.Empty;

        // when
        ValueTask<Message> addMessageTask =
            this.messageService.AddMessageAsync(randomMessage);

        // then
        await Assert.ThrowsAsync<MessageValidationException>(
            testCode: async () => await addMessageTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertMessageAsync(It.IsAny<Message>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenReceiverIdIsEmpty()
    {
        // given
        Message randomMessage = CreateRandomMessage();
        randomMessage.ReceiverId = Guid.Empty;

        // when
        ValueTask<Message> addMessageTask =
            this.messageService.AddMessageAsync(randomMessage);

        // then
        await Assert.ThrowsAsync<MessageValidationException>(
            testCode: async () => await addMessageTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertMessageAsync(It.IsAny<Message>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
