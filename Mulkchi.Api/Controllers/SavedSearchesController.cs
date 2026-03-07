using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Common;
using Mulkchi.Api.Models.Foundations.SavedSearches;
using Mulkchi.Api.Models.Foundations.SavedSearches.Exceptions;
using Mulkchi.Api.Services.Foundations.SavedSearches;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SavedSearchesController : ControllerBase
{
    private readonly ISavedSearchService savedSearchService;

    public SavedSearchesController(ISavedSearchService savedSearchService)
    {
        this.savedSearchService = savedSearchService;
    }

    [HttpPost]
    [Authorize]
    public async ValueTask<ActionResult<SavedSearch>> PostSavedSearchAsync(SavedSearch savedSearch)
    {
        try
        {
            SavedSearch addedSavedSearch = await this.savedSearchService.AddSavedSearchAsync(savedSearch);
            return Created("savedSearch", addedSavedSearch);
        }
        catch (SavedSearchValidationException savedSearchValidationException)
        {
            return BadRequest(savedSearchValidationException.InnerException);
        }
        catch (SavedSearchDependencyValidationException savedSearchDependencyValidationException)
        {
            return BadRequest(savedSearchDependencyValidationException.InnerException);
        }
        catch (SavedSearchDependencyException savedSearchDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, savedSearchDependencyException.InnerException);
        }
        catch (SavedSearchServiceException savedSearchServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, savedSearchServiceException.InnerException);
        }
    }

    [HttpGet]
    [Authorize]
    public ActionResult<PagedResult<SavedSearch>> GetAllSavedSearches([FromQuery] PaginationParams pagination)
    {
        try
        {
            IQueryable<SavedSearch> query = this.savedSearchService.RetrieveAllSavedSearches();
            int totalCount = query.Count();

            var items = query
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToList();

            var result = new PagedResult<SavedSearch>
            {
                Items = items,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };

            return Ok(result);
        }
        catch (SavedSearchDependencyException savedSearchDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, savedSearchDependencyException.InnerException);
        }
        catch (SavedSearchServiceException savedSearchServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, savedSearchServiceException.InnerException);
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<SavedSearch>> GetSavedSearchByIdAsync(Guid id)
    {
        try
        {
            SavedSearch savedSearch = await this.savedSearchService.RetrieveSavedSearchByIdAsync(id);
            return Ok(savedSearch);
        }
        catch (SavedSearchValidationException savedSearchValidationException)
        {
            return BadRequest(savedSearchValidationException.InnerException);
        }
        catch (SavedSearchDependencyValidationException savedSearchDependencyValidationException)
            when (savedSearchDependencyValidationException.InnerException is NotFoundSavedSearchException)
        {
            return NotFound(savedSearchDependencyValidationException.InnerException);
        }
        catch (SavedSearchDependencyValidationException savedSearchDependencyValidationException)
        {
            return BadRequest(savedSearchDependencyValidationException.InnerException);
        }
        catch (SavedSearchDependencyException savedSearchDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, savedSearchDependencyException.InnerException);
        }
        catch (SavedSearchServiceException savedSearchServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, savedSearchServiceException.InnerException);
        }
    }

    [HttpPut]
    [Authorize]
    public async ValueTask<ActionResult<SavedSearch>> PutSavedSearchAsync(SavedSearch savedSearch)
    {
        try
        {
            SavedSearch modifiedSavedSearch = await this.savedSearchService.ModifySavedSearchAsync(savedSearch);
            return Ok(modifiedSavedSearch);
        }
        catch (SavedSearchValidationException savedSearchValidationException)
        {
            return BadRequest(savedSearchValidationException.InnerException);
        }
        catch (SavedSearchDependencyValidationException savedSearchDependencyValidationException)
            when (savedSearchDependencyValidationException.InnerException is NotFoundSavedSearchException)
        {
            return NotFound(savedSearchDependencyValidationException.InnerException);
        }
        catch (SavedSearchDependencyValidationException savedSearchDependencyValidationException)
        {
            return BadRequest(savedSearchDependencyValidationException.InnerException);
        }
        catch (SavedSearchDependencyException savedSearchDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, savedSearchDependencyException.InnerException);
        }
        catch (SavedSearchServiceException savedSearchServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, savedSearchServiceException.InnerException);
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<SavedSearch>> DeleteSavedSearchByIdAsync(Guid id)
    {
        try
        {
            SavedSearch deletedSavedSearch = await this.savedSearchService.RemoveSavedSearchByIdAsync(id);
            return Ok(deletedSavedSearch);
        }
        catch (SavedSearchValidationException savedSearchValidationException)
        {
            return BadRequest(savedSearchValidationException.InnerException);
        }
        catch (SavedSearchDependencyValidationException savedSearchDependencyValidationException)
            when (savedSearchDependencyValidationException.InnerException is NotFoundSavedSearchException)
        {
            return NotFound(savedSearchDependencyValidationException.InnerException);
        }
        catch (SavedSearchDependencyValidationException savedSearchDependencyValidationException)
        {
            return BadRequest(savedSearchDependencyValidationException.InnerException);
        }
        catch (SavedSearchDependencyException savedSearchDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, savedSearchDependencyException.InnerException);
        }
        catch (SavedSearchServiceException savedSearchServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, savedSearchServiceException.InnerException);
        }
    }
}
