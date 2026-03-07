using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Common;
using Mulkchi.Api.Models.Foundations.Reviews;
using Mulkchi.Api.Models.Foundations.Reviews.Exceptions;
using Mulkchi.Api.Services.Foundations.Reviews;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        this.reviewService = reviewService;
    }

    [HttpPost]
    [Authorize]
    public async ValueTask<ActionResult<Review>> PostReviewAsync(Review review)
    {
        try
        {
            Review addedReview = await this.reviewService.AddReviewAsync(review);
            return Created("review", addedReview);
        }
        catch (ReviewValidationException reviewValidationException)
        {
            return BadRequest(reviewValidationException.InnerException);
        }
        catch (ReviewDependencyValidationException reviewDependencyValidationException)
        {
            return BadRequest(reviewDependencyValidationException.InnerException);
        }
        catch (ReviewDependencyException reviewDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, reviewDependencyException.InnerException);
        }
        catch (ReviewServiceException reviewServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, reviewServiceException.InnerException);
        }
    }

    [HttpGet]
    [AllowAnonymous]
    public ActionResult<PagedResult<Review>> GetAllReviews([FromQuery] PaginationParams pagination)
    {
        try
        {
            IQueryable<Review> query = this.reviewService.RetrieveAllReviews();
            int totalCount = query.Count();

            var items = query
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToList();

            var result = new PagedResult<Review>
            {
                Items = items,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };

            return Ok(result);
        }
        catch (ReviewDependencyException reviewDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, reviewDependencyException.InnerException);
        }
        catch (ReviewServiceException reviewServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, reviewServiceException.InnerException);
        }
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async ValueTask<ActionResult<Review>> GetReviewByIdAsync(Guid id)
    {
        try
        {
            Review review = await this.reviewService.RetrieveReviewByIdAsync(id);
            return Ok(review);
        }
        catch (ReviewValidationException reviewValidationException)
        {
            return BadRequest(reviewValidationException.InnerException);
        }
        catch (ReviewDependencyValidationException reviewDependencyValidationException)
            when (reviewDependencyValidationException.InnerException is NotFoundReviewException)
        {
            return NotFound(reviewDependencyValidationException.InnerException);
        }
        catch (ReviewDependencyValidationException reviewDependencyValidationException)
        {
            return BadRequest(reviewDependencyValidationException.InnerException);
        }
        catch (ReviewDependencyException reviewDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, reviewDependencyException.InnerException);
        }
        catch (ReviewServiceException reviewServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, reviewServiceException.InnerException);
        }
    }

    [HttpPut]
    [Authorize]
    public async ValueTask<ActionResult<Review>> PutReviewAsync(Review review)
    {
        try
        {
            Review modifiedReview = await this.reviewService.ModifyReviewAsync(review);
            return Ok(modifiedReview);
        }
        catch (ReviewValidationException reviewValidationException)
        {
            return BadRequest(reviewValidationException.InnerException);
        }
        catch (ReviewDependencyValidationException reviewDependencyValidationException)
            when (reviewDependencyValidationException.InnerException is NotFoundReviewException)
        {
            return NotFound(reviewDependencyValidationException.InnerException);
        }
        catch (ReviewDependencyValidationException reviewDependencyValidationException)
        {
            return BadRequest(reviewDependencyValidationException.InnerException);
        }
        catch (ReviewDependencyException reviewDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, reviewDependencyException.InnerException);
        }
        catch (ReviewServiceException reviewServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, reviewServiceException.InnerException);
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<Review>> DeleteReviewByIdAsync(Guid id)
    {
        try
        {
            Review deletedReview = await this.reviewService.RemoveReviewByIdAsync(id);
            return Ok(deletedReview);
        }
        catch (ReviewValidationException reviewValidationException)
        {
            return BadRequest(reviewValidationException.InnerException);
        }
        catch (ReviewDependencyValidationException reviewDependencyValidationException)
            when (reviewDependencyValidationException.InnerException is NotFoundReviewException)
        {
            return NotFound(reviewDependencyValidationException.InnerException);
        }
        catch (ReviewDependencyValidationException reviewDependencyValidationException)
        {
            return BadRequest(reviewDependencyValidationException.InnerException);
        }
        catch (ReviewDependencyException reviewDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, reviewDependencyException.InnerException);
        }
        catch (ReviewServiceException reviewServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, reviewServiceException.InnerException);
        }
    }
}
