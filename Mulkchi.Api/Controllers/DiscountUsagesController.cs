using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Common;
using Mulkchi.Api.Models.Foundations.Discounts;
using Mulkchi.Api.Models.Foundations.Discounts.Exceptions;
using Mulkchi.Api.Services.Foundations.DiscountUsages;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiscountUsagesController : ControllerBase
{
    private readonly IDiscountUsageService discountUsageService;

    public DiscountUsagesController(IDiscountUsageService discountUsageService)
    {
        this.discountUsageService = discountUsageService;
    }

    [HttpPost]
    [Authorize]
    public async ValueTask<ActionResult<DiscountUsage>> PostDiscountUsageAsync(DiscountUsage discountUsage)
    {
        try
        {
            DiscountUsage addedDiscountUsage = await this.discountUsageService.AddDiscountUsageAsync(discountUsage);
            return Created("discountUsage", addedDiscountUsage);
        }
        catch (DiscountUsageValidationException discountUsageValidationException)
        {
            return BadRequest(discountUsageValidationException.InnerException);
        }
        catch (DiscountUsageDependencyValidationException discountUsageDependencyValidationException)
        {
            return BadRequest(discountUsageDependencyValidationException.InnerException);
        }
        catch (DiscountUsageDependencyException discountUsageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountUsageDependencyException.InnerException);
        }
        catch (DiscountUsageServiceException discountUsageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountUsageServiceException.InnerException);
        }
    }

    [HttpGet]
    [Authorize]
    public ActionResult<PagedResult<DiscountUsage>> GetAllDiscountUsages([FromQuery] PaginationParams pagination)
    {
        try
        {
            IQueryable<DiscountUsage> query = this.discountUsageService.RetrieveAllDiscountUsages();
            int totalCount = query.Count();

            var items = query
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToList();

            var result = new PagedResult<DiscountUsage>
            {
                Items = items,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };

            return Ok(result);
        }
        catch (DiscountUsageDependencyException discountUsageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountUsageDependencyException.InnerException);
        }
        catch (DiscountUsageServiceException discountUsageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountUsageServiceException.InnerException);
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<DiscountUsage>> GetDiscountUsageByIdAsync(Guid id)
    {
        try
        {
            DiscountUsage discountUsage = await this.discountUsageService.RetrieveDiscountUsageByIdAsync(id);
            return Ok(discountUsage);
        }
        catch (DiscountUsageValidationException discountUsageValidationException)
        {
            return BadRequest(discountUsageValidationException.InnerException);
        }
        catch (DiscountUsageDependencyValidationException discountUsageDependencyValidationException)
            when (discountUsageDependencyValidationException.InnerException is NotFoundDiscountUsageException)
        {
            return NotFound(discountUsageDependencyValidationException.InnerException);
        }
        catch (DiscountUsageDependencyValidationException discountUsageDependencyValidationException)
        {
            return BadRequest(discountUsageDependencyValidationException.InnerException);
        }
        catch (DiscountUsageDependencyException discountUsageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountUsageDependencyException.InnerException);
        }
        catch (DiscountUsageServiceException discountUsageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountUsageServiceException.InnerException);
        }
    }

    [HttpPut]
    [Authorize]
    public async ValueTask<ActionResult<DiscountUsage>> PutDiscountUsageAsync(DiscountUsage discountUsage)
    {
        try
        {
            DiscountUsage modifiedDiscountUsage = await this.discountUsageService.ModifyDiscountUsageAsync(discountUsage);
            return Ok(modifiedDiscountUsage);
        }
        catch (DiscountUsageValidationException discountUsageValidationException)
        {
            return BadRequest(discountUsageValidationException.InnerException);
        }
        catch (DiscountUsageDependencyValidationException discountUsageDependencyValidationException)
            when (discountUsageDependencyValidationException.InnerException is NotFoundDiscountUsageException)
        {
            return NotFound(discountUsageDependencyValidationException.InnerException);
        }
        catch (DiscountUsageDependencyValidationException discountUsageDependencyValidationException)
        {
            return BadRequest(discountUsageDependencyValidationException.InnerException);
        }
        catch (DiscountUsageDependencyException discountUsageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountUsageDependencyException.InnerException);
        }
        catch (DiscountUsageServiceException discountUsageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountUsageServiceException.InnerException);
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<DiscountUsage>> DeleteDiscountUsageByIdAsync(Guid id)
    {
        try
        {
            DiscountUsage deletedDiscountUsage = await this.discountUsageService.RemoveDiscountUsageByIdAsync(id);
            return Ok(deletedDiscountUsage);
        }
        catch (DiscountUsageValidationException discountUsageValidationException)
        {
            return BadRequest(discountUsageValidationException.InnerException);
        }
        catch (DiscountUsageDependencyValidationException discountUsageDependencyValidationException)
            when (discountUsageDependencyValidationException.InnerException is NotFoundDiscountUsageException)
        {
            return NotFound(discountUsageDependencyValidationException.InnerException);
        }
        catch (DiscountUsageDependencyValidationException discountUsageDependencyValidationException)
        {
            return BadRequest(discountUsageDependencyValidationException.InnerException);
        }
        catch (DiscountUsageDependencyException discountUsageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountUsageDependencyException.InnerException);
        }
        catch (DiscountUsageServiceException discountUsageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountUsageServiceException.InnerException);
        }
    }
}
