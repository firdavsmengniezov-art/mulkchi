using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Messages;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Messages;

public partial class MessageServiceTests
{
    [Fact]
    public async Task ShouldAddMessageAsync()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        Message randomMessage = CreateRandomMessage();
        Message inputMessage = randomMessage;
        inputMessage.CreatedDate = randomDateTimeOffset;
        inputMessage.UpdatedDate = randomDateTimeOffset;
        Message expectedMessage = inputMessage;

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(randomDateTimeOffset);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertMessageAsync(inputMessage))
                .ReturnsAsync(expectedMessage);

        // when
        Message actualMessage = await this.messageService.AddMessageAsync(inputMessage);

        // then
        actualMessage.Should().BeEquivalentTo(expectedMessage);

        this.dateTimeBrokerMock.Verify(broker =>
            broker.GetCurrentDateTimeOffset(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertMessageAsync(inputMessage),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
