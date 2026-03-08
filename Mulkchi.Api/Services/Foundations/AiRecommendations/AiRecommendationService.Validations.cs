using Mulkchi.Api.Models.Foundations.AIs;
using Mulkchi.Api.Models.Foundations.AIs.Exceptions;
using Xeptions;

namespace Mulkchi.Api.Services.Foundations.AiRecommendations;

public partial class AiRecommendationService
{
    private void ValidateAiRecommendationOnAdd(AiRecommendation aiRecommendation)
    {
        ValidateAiRecommendationIsNotNull(aiRecommendation);
        Validate(
        (Rule: IsInvalid(aiRecommendation.Id), Parameter: nameof(AiRecommendation.Id)),
        (Rule: IsInvalid(aiRecommendation.UserId), Parameter: nameof(AiRecommendation.UserId)),
        (Rule: IsInvalid(aiRecommendation.Title), Parameter: nameof(AiRecommendation.Title)),
        (Rule: IsInvalid(aiRecommendation.Description), Parameter: nameof(AiRecommendation.Description)));
    }

    private void ValidateAiRecommendationOnModify(AiRecommendation aiRecommendation)
    {
        ValidateAiRecommendationIsNotNull(aiRecommendation);
        Validate(
        (Rule: IsInvalid(aiRecommendation.Id), Parameter: nameof(AiRecommendation.Id)),
        (Rule: IsInvalid(aiRecommendation.UserId), Parameter: nameof(AiRecommendation.UserId)),
        (Rule: IsInvalid(aiRecommendation.Title), Parameter: nameof(AiRecommendation.Title)),
        (Rule: IsInvalid(aiRecommendation.Description), Parameter: nameof(AiRecommendation.Description)));
    }

    private static void ValidateAiRecommendationId(Guid aiRecommendationId)
    {
        if (aiRecommendationId == Guid.Empty)
        {
            throw new InvalidAiRecommendationException(
                message: "AiRecommendation id is invalid.");
        }
    }

    private static void ValidateAiRecommendationIsNotNull(AiRecommendation aiRecommendation)
    {
        if (aiRecommendation is null)
            throw new NullAiRecommendationException(message: "AiRecommendation is null.");
    }

    private static dynamic IsInvalid(Guid id) => new
    {
        Condition = id == Guid.Empty,
        Message = "Id is required."
    };

    private static dynamic IsInvalid(string text) => new
    {
        Condition = string.IsNullOrWhiteSpace(text),
        Message = "Value is required."
    };

    private void Validate(params (dynamic Rule, string Parameter)[] validations)
    {
        var invalidAiRecommendationException =
            new InvalidAiRecommendationException(message: "AiRecommendation data is invalid.");

        foreach ((dynamic rule, string parameter) in validations)
        {
            if (rule.Condition)
                invalidAiRecommendationException.UpsertDataList(parameter, rule.Message);
        }

        invalidAiRecommendationException.ThrowIfContainsErrors();
    }
}
