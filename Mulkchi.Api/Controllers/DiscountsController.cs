using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Common;
using Mulkchi.Api.Models.Foundations.Discounts;
using Mulkchi.Api.Models.Foundations.Discounts.Exceptions;
using Mulkchi.Api.Services.Foundations.Discounts;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiscountsController : ControllerBase
{
    private readonly IDiscountService discountService;

    public DiscountsController(IDiscountService discountService)
    {
        this.discountService = discountService;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Host")]
    public async ValueTask<ActionResult<Discount>> PostDiscountAsync(Discount discount)
    {
        try
        {
            Discount addedDiscount = await this.discountService.AddDiscountAsync(discount);
            return Created("discount", addedDiscount);
        }
        catch (DiscountValidationException discountValidationException)
        {
            return BadRequest(discountValidationException.InnerException);
        }
        catch (DiscountDependencyValidationException discountDependencyValidationException)
        {
            return BadRequest(discountDependencyValidationException.InnerException);
        }
        catch (DiscountDependencyException discountDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountDependencyException.InnerException);
        }
        catch (DiscountServiceException discountServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountServiceException.InnerException);
        }
    }

    [HttpGet]
    [AllowAnonymous]
    public ActionResult<PagedResult<Discount>> GetAllDiscounts([FromQuery] PaginationParams pagination)
    {
        try
        {
            IQueryable<Discount> query = this.discountService.RetrieveAllDiscounts();
            int totalCount = query.Count();

            var items = query
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToList();

            var result = new PagedResult<Discount>
            {
                Items = items,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };

            return Ok(result);
        }
        catch (DiscountDependencyException discountDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountDependencyException.InnerException);
        }
        catch (DiscountServiceException discountServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountServiceException.InnerException);
        }
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async ValueTask<ActionResult<Discount>> GetDiscountByIdAsync(Guid id)
    {
        try
        {
            Discount discount = await this.discountService.RetrieveDiscountByIdAsync(id);
            return Ok(discount);
        }
        catch (DiscountValidationException discountValidationException)
        {
            return BadRequest(discountValidationException.InnerException);
        }
        catch (DiscountDependencyValidationException discountDependencyValidationException)
            when (discountDependencyValidationException.InnerException is NotFoundDiscountException)
        {
            return NotFound(discountDependencyValidationException.InnerException);
        }
        catch (DiscountDependencyValidationException discountDependencyValidationException)
        {
            return BadRequest(discountDependencyValidationException.InnerException);
        }
        catch (DiscountDependencyException discountDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountDependencyException.InnerException);
        }
        catch (DiscountServiceException discountServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountServiceException.InnerException);
        }
    }

    [HttpPut]
    [Authorize(Roles = "Admin,Host")]
    public async ValueTask<ActionResult<Discount>> PutDiscountAsync(Discount discount)
    {
        try
        {
            Discount modifiedDiscount = await this.discountService.ModifyDiscountAsync(discount);
            return Ok(modifiedDiscount);
        }
        catch (DiscountValidationException discountValidationException)
        {
            return BadRequest(discountValidationException.InnerException);
        }
        catch (DiscountDependencyValidationException discountDependencyValidationException)
            when (discountDependencyValidationException.InnerException is NotFoundDiscountException)
        {
            return NotFound(discountDependencyValidationException.InnerException);
        }
        catch (DiscountDependencyValidationException discountDependencyValidationException)
        {
            return BadRequest(discountDependencyValidationException.InnerException);
        }
        catch (DiscountDependencyException discountDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountDependencyException.InnerException);
        }
        catch (DiscountServiceException discountServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountServiceException.InnerException);
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Host")]
    public async ValueTask<ActionResult<Discount>> DeleteDiscountByIdAsync(Guid id)
    {
        try
        {
            Discount deletedDiscount = await this.discountService.RemoveDiscountByIdAsync(id);
            return Ok(deletedDiscount);
        }
        catch (DiscountValidationException discountValidationException)
        {
            return BadRequest(discountValidationException.InnerException);
        }
        catch (DiscountDependencyValidationException discountDependencyValidationException)
            when (discountDependencyValidationException.InnerException is NotFoundDiscountException)
        {
            return NotFound(discountDependencyValidationException.InnerException);
        }
        catch (DiscountDependencyValidationException discountDependencyValidationException)
        {
            return BadRequest(discountDependencyValidationException.InnerException);
        }
        catch (DiscountDependencyException discountDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountDependencyException.InnerException);
        }
        catch (DiscountServiceException discountServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, discountServiceException.InnerException);
        }
    }
}
