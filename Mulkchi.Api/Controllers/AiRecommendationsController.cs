using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.AIs;
using Mulkchi.Api.Models.Foundations.AIs.Exceptions;
using Mulkchi.Api.Services.Foundations.AiRecommendations;

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
            return BadRequest(aiRecommendationValidationException.InnerException);
        }
        catch (AiRecommendationDependencyValidationException aiRecommendationDependencyValidationException)
        {
            return BadRequest(aiRecommendationDependencyValidationException.InnerException);
        }
        catch (AiRecommendationDependencyException aiRecommendationDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, aiRecommendationDependencyException.InnerException);
        }
        catch (AiRecommendationServiceException aiRecommendationServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, aiRecommendationServiceException.InnerException);
        }
    }

    [HttpGet]
    [Authorize]
    public ActionResult<IQueryable<AiRecommendation>> GetAllAiRecommendations()
    {
        try
        {
            IQueryable<AiRecommendation> aiRecommendations = this.aiRecommendationService.RetrieveAllAiRecommendations();
            return Ok(aiRecommendations);
        }
        catch (AiRecommendationDependencyException aiRecommendationDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, aiRecommendationDependencyException.InnerException);
        }
        catch (AiRecommendationServiceException aiRecommendationServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, aiRecommendationServiceException.InnerException);
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
            return BadRequest(aiRecommendationValidationException.InnerException);
        }
        catch (AiRecommendationDependencyValidationException aiRecommendationDependencyValidationException)
            when (aiRecommendationDependencyValidationException.InnerException is NotFoundAiRecommendationException)
        {
            return NotFound(aiRecommendationDependencyValidationException.InnerException);
        }
        catch (AiRecommendationDependencyValidationException aiRecommendationDependencyValidationException)
        {
            return BadRequest(aiRecommendationDependencyValidationException.InnerException);
        }
        catch (AiRecommendationDependencyException aiRecommendationDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, aiRecommendationDependencyException.InnerException);
        }
        catch (AiRecommendationServiceException aiRecommendationServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, aiRecommendationServiceException.InnerException);
        }
    }

    [HttpPut]
    [Authorize]
    public async ValueTask<ActionResult<AiRecommendation>> PutAiRecommendationAsync(AiRecommendation aiRecommendation)
    {
        try
        {
            AiRecommendation modifiedAiRecommendation = await this.aiRecommendationService.ModifyAiRecommendationAsync(aiRecommendation);
            return Ok(modifiedAiRecommendation);
        }
        catch (AiRecommendationValidationException aiRecommendationValidationException)
        {
            return BadRequest(aiRecommendationValidationException.InnerException);
        }
        catch (AiRecommendationDependencyValidationException aiRecommendationDependencyValidationException)
            when (aiRecommendationDependencyValidationException.InnerException is NotFoundAiRecommendationException)
        {
            return NotFound(aiRecommendationDependencyValidationException.InnerException);
        }
        catch (AiRecommendationDependencyValidationException aiRecommendationDependencyValidationException)
        {
            return BadRequest(aiRecommendationDependencyValidationException.InnerException);
        }
        catch (AiRecommendationDependencyException aiRecommendationDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, aiRecommendationDependencyException.InnerException);
        }
        catch (AiRecommendationServiceException aiRecommendationServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, aiRecommendationServiceException.InnerException);
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<AiRecommendation>> DeleteAiRecommendationByIdAsync(Guid id)
    {
        try
        {
            AiRecommendation deletedAiRecommendation = await this.aiRecommendationService.RemoveAiRecommendationByIdAsync(id);
            return Ok(deletedAiRecommendation);
        }
        catch (AiRecommendationValidationException aiRecommendationValidationException)
        {
            return BadRequest(aiRecommendationValidationException.InnerException);
        }
        catch (AiRecommendationDependencyValidationException aiRecommendationDependencyValidationException)
            when (aiRecommendationDependencyValidationException.InnerException is NotFoundAiRecommendationException)
        {
            return NotFound(aiRecommendationDependencyValidationException.InnerException);
        }
        catch (AiRecommendationDependencyValidationException aiRecommendationDependencyValidationException)
        {
            return BadRequest(aiRecommendationDependencyValidationException.InnerException);
        }
        catch (AiRecommendationDependencyException aiRecommendationDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, aiRecommendationDependencyException.InnerException);
        }
        catch (AiRecommendationServiceException aiRecommendationServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, aiRecommendationServiceException.InnerException);
        }
    }
}
