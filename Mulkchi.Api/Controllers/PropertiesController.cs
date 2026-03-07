using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Common;
using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.Properties.Exceptions;
using Mulkchi.Api.Services.Foundations.Properties;

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
    public async ValueTask<ActionResult<Property>> PostPropertyAsync(Property property)
    {
        try
        {
            Property addedProperty = await this.propertyService.AddPropertyAsync(property);
            return Created("property", addedProperty);
        }
        catch (PropertyValidationException propertyValidationException)
        {
            return BadRequest(propertyValidationException.InnerException);
        }
        catch (PropertyDependencyValidationException propertyDependencyValidationException)
        {
            return BadRequest(propertyDependencyValidationException.InnerException);
        }
        catch (PropertyDependencyException propertyDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyDependencyException.InnerException);
        }
        catch (PropertyServiceException propertyServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyServiceException.InnerException);
        }
    }

    [HttpGet]
    [AllowAnonymous]
    public ActionResult<PagedResult<Property>> GetAllProperties(
        [FromQuery] PaginationParams pagination,
        [FromQuery] string? city = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] int? bedrooms = null)
    {
        try
        {
            IQueryable<Property> query = this.propertyService.RetrieveAllProperties();

            if (!string.IsNullOrWhiteSpace(city))
                query = query.Where(p => p.City == city);

            if (minPrice.HasValue)
                query = query.Where(p => p.MonthlyRent >= minPrice || p.SalePrice >= minPrice || p.PricePerNight >= minPrice);

            if (maxPrice.HasValue)
                query = query.Where(p => p.MonthlyRent <= maxPrice || p.SalePrice <= maxPrice || p.PricePerNight <= maxPrice);

            if (bedrooms.HasValue)
                query = query.Where(p => p.NumberOfBedrooms == bedrooms);

            int totalCount = query.Count();

            var items = query
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToList();

            var result = new PagedResult<Property>
            {
                Items = items,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };

            return Ok(result);
        }
        catch (PropertyDependencyException propertyDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyDependencyException.InnerException);
        }
        catch (PropertyServiceException propertyServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyServiceException.InnerException);
        }
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async ValueTask<ActionResult<Property>> GetPropertyByIdAsync(Guid id)
    {
        try
        {
            Property property = await this.propertyService.RetrievePropertyByIdAsync(id);
            return Ok(property);
        }
        catch (PropertyValidationException propertyValidationException)
        {
            return BadRequest(propertyValidationException.InnerException);
        }
        catch (PropertyDependencyValidationException propertyDependencyValidationException)
            when (propertyDependencyValidationException.InnerException is NotFoundPropertyException)
        {
            return NotFound(propertyDependencyValidationException.InnerException);
        }
        catch (PropertyDependencyValidationException propertyDependencyValidationException)
        {
            return BadRequest(propertyDependencyValidationException.InnerException);
        }
        catch (PropertyDependencyException propertyDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyDependencyException.InnerException);
        }
        catch (PropertyServiceException propertyServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyServiceException.InnerException);
        }
    }

    [HttpPut]
    [Authorize(Roles = "Host,Admin")]
    public async ValueTask<ActionResult<Property>> PutPropertyAsync(Property property)
    {
        try
        {
            Property modifiedProperty = await this.propertyService.ModifyPropertyAsync(property);
            return Ok(modifiedProperty);
        }
        catch (PropertyValidationException propertyValidationException)
        {
            return BadRequest(propertyValidationException.InnerException);
        }
        catch (PropertyDependencyValidationException propertyDependencyValidationException)
            when (propertyDependencyValidationException.InnerException is NotFoundPropertyException)
        {
            return NotFound(propertyDependencyValidationException.InnerException);
        }
        catch (PropertyDependencyValidationException propertyDependencyValidationException)
        {
            return BadRequest(propertyDependencyValidationException.InnerException);
        }
        catch (PropertyDependencyException propertyDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyDependencyException.InnerException);
        }
        catch (PropertyServiceException propertyServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyServiceException.InnerException);
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Host,Admin")]
    public async ValueTask<ActionResult<Property>> DeletePropertyByIdAsync(Guid id)
    {
        try
        {
            Property deletedProperty = await this.propertyService.RemovePropertyByIdAsync(id);
            return Ok(deletedProperty);
        }
        catch (PropertyValidationException propertyValidationException)
        {
            return BadRequest(propertyValidationException.InnerException);
        }
        catch (PropertyDependencyValidationException propertyDependencyValidationException)
            when (propertyDependencyValidationException.InnerException is NotFoundPropertyException)
        {
            return NotFound(propertyDependencyValidationException.InnerException);
        }
        catch (PropertyDependencyValidationException propertyDependencyValidationException)
        {
            return BadRequest(propertyDependencyValidationException.InnerException);
        }
        catch (PropertyDependencyException propertyDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyDependencyException.InnerException);
        }
        catch (PropertyServiceException propertyServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyServiceException.InnerException);
        }
    }
}
