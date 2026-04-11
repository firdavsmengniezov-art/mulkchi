using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Models.Foundations.AIs;
using Mulkchi.Api.Models.Foundations.AIs.Exceptions;
using Mulkchi.Api.Models.Foundations.Common;
using Mulkchi.Api.Services.Foundations.AiRecommendations;
using System.Security.Claims;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiRecommendationsController : ControllerBase
{
    private readonly IAiRecommendationService aiRecommendationService;

    public AiRecommendationsController(IAiRecommendationService aiRecommendationService)
    {
        this.aiRecommendationService = aiRecommendationService;
    }

    [HttpPost]
    [Authorize]
    public async ValueTask<ActionResult<AiRecommendation>> PostAiRecommendationAsync(AiRecommendation aiRecommendation)
    {
        try
        {
            AiRecommendation addedAiRecommendation = await this.aiRecommendationService.AddAiRecommendationAsync(aiRecommendation);
            return Created("aiRecommendation", addedAiRecommendation);
        }
        catch (AiRecommendationValidationException aiRecommendationValidationException)
        {
            return BadRequest(new { message = aiRecommendationValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AiRecommendationDependencyValidationException aiRecommendationDependencyValidationException)
        {
            return BadRequest(new { message = aiRecommendationDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AiRecommendationDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (AiRecommendationServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<PagedResult<AiRecommendation>>> GetAllAiRecommendations([FromQuery] PaginationParams pagination)
    {
        try
        {
            IQueryable<AiRecommendation> query = this.aiRecommendationService.RetrieveAllAiRecommendations();
            int totalCount = await query.CountAsync();

            var items = await query
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            var result = new PagedResult<AiRecommendation>
            {
                Items = items,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };

            return Ok(result);
        }
        catch (AiRecommendationDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (AiRecommendationServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<AiRecommendation>> GetAiRecommendationByIdAsync(Guid id)
    {
        try
        {
            AiRecommendation aiRecommendation = await this.aiRecommendationService.RetrieveAiRecommendationByIdAsync(id);
            return Ok(aiRecommendation);
        }
        catch (AiRecommendationValidationException aiRecommendationValidationException)
        {
            return BadRequest(new { message = aiRecommendationValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AiRecommendationDependencyValidationException aiRecommendationDependencyValidationException)
            when (aiRecommendationDependencyValidationException.InnerException is NotFoundAiRecommendationException)
        {
            return NotFound(new { message = aiRecommendationDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AiRecommendationDependencyValidationException aiRecommendationDependencyValidationException)
        {
            return BadRequest(new { message = aiRecommendationDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AiRecommendationDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (AiRecommendationServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpPut]
    [Authorize]
    public async ValueTask<ActionResult<AiRecommendation>> PutAiRecommendationAsync(AiRecommendation aiRecommendation)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                return Unauthorized();

            bool isAdmin = User.IsInRole("Admin");
            if (!isAdmin)
            {
                AiRecommendation existing =
                    await this.aiRecommendationService.RetrieveAiRecommendationByIdAsync(aiRecommendation.Id);

                if (existing is null)
                    return NotFound(new { message = "AI recommendation not found." });

                if (existing.UserId != currentUserId)
                    return Forbid();
            }

            AiRecommendation modifiedAiRecommendation =
                await this.aiRecommendationService.ModifyAiRecommendationAsync(aiRecommendation);

            return Ok(modifiedAiRecommendation);
        }
        catch (AiRecommendationValidationException aiRecommendationValidationException)
        {
            return BadRequest(new { message = aiRecommendationValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AiRecommendationDependencyValidationException aiRecommendationDependencyValidationException)
            when (aiRecommendationDependencyValidationException.InnerException is NotFoundAiRecommendationException)
        {
            return NotFound(new { message = aiRecommendationDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AiRecommendationDependencyValidationException aiRecommendationDependencyValidationException)
        {
            return BadRequest(new { message = aiRecommendationDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AiRecommendationDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (AiRecommendationServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<AiRecommendation>> DeleteAiRecommendationByIdAsync(Guid id)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                return Unauthorized();

            bool isAdmin = User.IsInRole("Admin");
            if (!isAdmin)
            {
                AiRecommendation existing =
                    await this.aiRecommendationService.RetrieveAiRecommendationByIdAsync(id);

                if (existing is null)
                    return NotFound(new { message = "AI recommendation not found." });

                if (existing.UserId != currentUserId)
                    return Forbid();
            }

            AiRecommendation deletedAiRecommendation =
                await this.aiRecommendationService.RemoveAiRecommendationByIdAsync(id);

            return Ok(deletedAiRecommendation);
        }
        catch (AiRecommendationValidationException aiRecommendationValidationException)
        {
            return BadRequest(new { message = aiRecommendationValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AiRecommendationDependencyValidationException aiRecommendationDependencyValidationException)
            when (aiRecommendationDependencyValidationException.InnerException is NotFoundAiRecommendationException)
        {
            return NotFound(new { message = aiRecommendationDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AiRecommendationDependencyValidationException aiRecommendationDependencyValidationException)
        {
            return BadRequest(new { message = aiRecommendationDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AiRecommendationDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (AiRecommendationServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpPost("hybrid")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<HybridRecommendationResponse>>> GetHybridRecommendationsAsync(
        [FromBody] HybridRecommendationRequest? request)
    {
        try
        {
            var normalizedRequest = request ?? new HybridRecommendationRequest();

            string? userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userIdClaim, out Guid claimUserId))
            {
                normalizedRequest.UserId = claimUserId;
            }

            IEnumerable<HybridRecommendationResponse> recommendations =
                await this.aiRecommendationService.RetrieveHybridRecommendationsAsync(normalizedRequest);

            return Ok(recommendations);
        }
        catch (AiRecommendationDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (AiRecommendationServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }
}
