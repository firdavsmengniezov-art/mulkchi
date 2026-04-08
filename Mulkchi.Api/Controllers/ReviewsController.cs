using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                return Unauthorized();

            review.ReviewerId = currentUserId;
            Review addedReview = await this.reviewService.AddReviewAsync(review);
            return Created("review", addedReview);
        }
        catch (ReviewValidationException reviewValidationException)
        {
            return BadRequest(new { message = reviewValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (ReviewDependencyValidationException reviewDependencyValidationException)
        {
            return BadRequest(new { message = reviewDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (ReviewDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (ReviewServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<Review>>> GetAllReviews([FromQuery] PaginationParams pagination)
    {
        try
        {
            IQueryable<Review> query = this.reviewService.RetrieveAllReviews();
            int totalCount = await query.CountAsync();

            var items = await query
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            var result = new PagedResult<Review>
            {
                Items = items,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };

            return Ok(result);
        }
        catch (ReviewDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (ReviewServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
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
            return BadRequest(new { message = reviewValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (ReviewDependencyValidationException reviewDependencyValidationException)
            when (reviewDependencyValidationException.InnerException is NotFoundReviewException)
        {
            return NotFound(new { message = reviewDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (ReviewDependencyValidationException reviewDependencyValidationException)
        {
            return BadRequest(new { message = reviewDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (ReviewDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (ReviewServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpPut]
    [Authorize]
    public async ValueTask<ActionResult<Review>> PutReviewAsync(Review review)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                return Unauthorized();

            bool isAdmin = User.IsInRole("Admin");
            if (!isAdmin)
            {
                Review existingReview = await this.reviewService.RetrieveReviewByIdAsync(review.Id);
                if (existingReview is null)
                    return NotFound(new { message = "Review not found." });

                if (existingReview.ReviewerId != currentUserId)
                    return Forbid();
            }

            Review modifiedReview = await this.reviewService.ModifyReviewAsync(review);
            return Ok(modifiedReview);
        }
        catch (ReviewValidationException reviewValidationException)
        {
            return BadRequest(new { message = reviewValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (ReviewDependencyValidationException reviewDependencyValidationException)
            when (reviewDependencyValidationException.InnerException is NotFoundReviewException)
        {
            return NotFound(new { message = reviewDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (ReviewDependencyValidationException reviewDependencyValidationException)
        {
            return BadRequest(new { message = reviewDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (ReviewDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (ReviewServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<Review>> DeleteReviewByIdAsync(Guid id)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                return Unauthorized();

            bool isAdmin = User.IsInRole("Admin");
            if (!isAdmin)
            {
                Review existingReview = await this.reviewService.RetrieveReviewByIdAsync(id);
                if (existingReview is null)
                    return NotFound(new { message = "Review not found." });

                if (existingReview.ReviewerId != currentUserId)
                    return Forbid();
            }

            Review deletedReview = await this.reviewService.RemoveReviewByIdAsync(id);
            return Ok(deletedReview);
        }
        catch (ReviewValidationException reviewValidationException)
        {
            return BadRequest(new { message = reviewValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (ReviewDependencyValidationException reviewDependencyValidationException)
            when (reviewDependencyValidationException.InnerException is NotFoundReviewException)
        {
            return NotFound(new { message = reviewDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (ReviewDependencyValidationException reviewDependencyValidationException)
        {
            return BadRequest(new { message = reviewDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (ReviewDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (ReviewServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }
}
