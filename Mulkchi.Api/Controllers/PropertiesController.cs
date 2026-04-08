using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Common;
using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.Properties.Exceptions;
using Mulkchi.Api.Services.Foundations.Properties;
using System.Threading.Tasks;
using System;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PropertiesController : ControllerBase
{
    private readonly IPropertyService propertyService;

    public PropertiesController(IPropertyService propertyService)
    {
        this.propertyService = propertyService;
    }

    [HttpPost]
    [Authorize(Roles = "Host,Admin")]
    public async Task<ActionResult<PropertyResponse>> PostPropertyAsync([FromBody] PropertyCreateDto dto)
    {
        try
        {
            var addedProperty = await this.propertyService.AddPropertyAsync(dto);
            return Created($"api/properties/{addedProperty.Id}", addedProperty);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (PropertyValidationException propertyValidationException)
        {
            return BadRequest(new { message = propertyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyDependencyValidationException propertyDependencyValidationException)
        {
            return BadRequest(new { message = propertyDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyDependencyException)
        {
            return StatusCode(500, new { message = "Internal server error." });
        }
        catch (PropertyServiceException)
        {
            return StatusCode(500, new { message = "Internal server error." });
        }
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<PropertyResponse>>> GetAllProperties([FromQuery] PropertyQueryParams queryParams)
    {
        try
        {
            var (items, total) = await this.propertyService.RetrieveAllPropertiesAsync(queryParams);

            var result = new PagedResult<PropertyResponse>
            {
                Items = items,
                TotalCount = total,
                Page = queryParams.Page,
                PageSize = queryParams.PageSize
            };

            return Ok(result);
        }
        catch (PropertyDependencyException)
        {
            return StatusCode(500, new { message = "Internal server error." });
        }
        catch (PropertyServiceException)
        {
            return StatusCode(500, new { message = "Internal server error." });
        }
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<PropertyResponse>> GetPropertyByIdAsync(Guid id)
    {
        try
        {
            var property = await this.propertyService.RetrievePropertyByIdAsync(id);
            if (property is null)
                return NotFound(new { message = $"Property with id '{id}' was not found." });
            return Ok(property);
        }
        catch (PropertyDependencyValidationException propertyDependencyValidationException)
        {
            return NotFound(new { message = propertyDependencyValidationException.InnerException?.Message ?? "Not found." });
        }
        catch (PropertyDependencyException)
        {
            return StatusCode(500, new { message = "Internal server error." });
        }
        catch (PropertyServiceException)
        {
            return StatusCode(500, new { message = "Internal server error." });
        }
    }

    [HttpGet("autocomplete")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<string>>> Autocomplete([FromQuery] string query)
    {
        try
        {
            var suggestions = await this.propertyService.SearchLocationSuggestionsAsync(query);
            return Ok(suggestions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("{id:guid}/similar")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<PropertyResponse>>> GetSimilarProperties(Guid id, [FromQuery] int count = 6)
    {
        try
        {
            var similar = await this.propertyService.RetrieveSimilarPropertiesAsync(id, count);
            return Ok(similar);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("featured")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<PropertyResponse>>> GetFeaturedProperties([FromQuery] int count = 8)
    {
        try
        {
            var featured = await this.propertyService.RetrieveFeaturedPropertiesAsync(count);
            return Ok(featured);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<PropertyResponse>>> SearchProperties([FromQuery] PropertySearchParams searchParams)
    {
        try
        {
            var (items, total) = await this.propertyService.SearchPropertiesAsync(searchParams);

            var result = new PagedResult<PropertyResponse>
            {
                Items = items,
                TotalCount = total,
                Page = 1,
                PageSize = 50 // Fixed size since no pagination fields
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
