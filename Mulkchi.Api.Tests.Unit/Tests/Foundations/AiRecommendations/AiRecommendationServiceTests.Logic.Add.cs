using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.AIs;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.AiRecommendations;

public partial class AiRecommendationServiceTests
{
    [Fact]
    public async Task ShouldAddAiRecommendationAsync()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        AiRecommendation randomAiRecommendation = CreateRandomAiRecommendation();
        AiRecommendation inputAiRecommendation = randomAiRecommendation;
        inputAiRecommendation.CreatedDate = randomDateTimeOffset;
        inputAiRecommendation.UpdatedDate = randomDateTimeOffset;
        AiRecommendation expectedAiRecommendation = inputAiRecommendation;

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(randomDateTimeOffset);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertAiRecommendationAsync(inputAiRecommendation))
                .ReturnsAsync(expectedAiRecommendation);

        // when
        AiRecommendation actualAiRecommendation = await this.aiRecommendationService.AddAiRecommendationAsync(inputAiRecommendation);

        // then
        actualAiRecommendation.Should().BeEquivalentTo(expectedAiRecommendation);

        this.dateTimeBrokerMock.Verify(broker =>
            broker.GetCurrentDateTimeOffset(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertAiRecommendationAsync(inputAiRecommendation),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
