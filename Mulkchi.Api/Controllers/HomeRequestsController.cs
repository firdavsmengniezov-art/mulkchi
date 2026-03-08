using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Common;
using Mulkchi.Api.Models.Foundations.HomeRequests;
using Mulkchi.Api.Models.Foundations.HomeRequests.Exceptions;
using Mulkchi.Api.Services.Foundations.HomeRequests;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HomeRequestsController : ControllerBase
{
    private readonly IHomeRequestService homeRequestService;

    public HomeRequestsController(IHomeRequestService homeRequestService)
    {
        this.homeRequestService = homeRequestService;
    }

    [HttpPost]
    [Authorize]
    public async ValueTask<ActionResult<HomeRequest>> PostHomeRequestAsync(HomeRequest homeRequest)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                return Unauthorized();

            homeRequest.GuestId = currentUserId;
            HomeRequest addedHomeRequest = await this.homeRequestService.AddHomeRequestAsync(homeRequest);
            return Created("homeRequest", addedHomeRequest);
        }
        catch (HomeRequestValidationException homeRequestValidationException)
        {
            return BadRequest(homeRequestValidationException.InnerException);
        }
        catch (HomeRequestDependencyValidationException homeRequestDependencyValidationException)
        {
            return BadRequest(homeRequestDependencyValidationException.InnerException);
        }
        catch (HomeRequestDependencyException homeRequestDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, homeRequestDependencyException.InnerException);
        }
        catch (HomeRequestServiceException homeRequestServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, homeRequestServiceException.InnerException);
        }
    }

    [HttpGet]
    [Authorize]
    public ActionResult<PagedResult<HomeRequest>> GetAllHomeRequests([FromQuery] PaginationParams pagination)
    {
        try
        {
            IQueryable<HomeRequest> query = this.homeRequestService.RetrieveAllHomeRequests();
            int totalCount = query.Count();

            var items = query
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToList();

            var result = new PagedResult<HomeRequest>
            {
                Items = items,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };

            return Ok(result);
        }
        catch (HomeRequestDependencyException homeRequestDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, homeRequestDependencyException.InnerException);
        }
        catch (HomeRequestServiceException homeRequestServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, homeRequestServiceException.InnerException);
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<HomeRequest>> GetHomeRequestByIdAsync(Guid id)
    {
        try
        {
            HomeRequest homeRequest = await this.homeRequestService.RetrieveHomeRequestByIdAsync(id);
            return Ok(homeRequest);
        }
        catch (HomeRequestValidationException homeRequestValidationException)
        {
            return BadRequest(homeRequestValidationException.InnerException);
        }
        catch (HomeRequestDependencyValidationException homeRequestDependencyValidationException)
            when (homeRequestDependencyValidationException.InnerException is NotFoundHomeRequestException)
        {
            return NotFound(homeRequestDependencyValidationException.InnerException);
        }
        catch (HomeRequestDependencyValidationException homeRequestDependencyValidationException)
        {
            return BadRequest(homeRequestDependencyValidationException.InnerException);
        }
        catch (HomeRequestDependencyException homeRequestDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, homeRequestDependencyException.InnerException);
        }
        catch (HomeRequestServiceException homeRequestServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, homeRequestServiceException.InnerException);
        }
    }

    [HttpPut]
    [Authorize]
    public async ValueTask<ActionResult<HomeRequest>> PutHomeRequestAsync(HomeRequest homeRequest)
    {
        try
        {
            HomeRequest modifiedHomeRequest = await this.homeRequestService.ModifyHomeRequestAsync(homeRequest);
            return Ok(modifiedHomeRequest);
        }
        catch (HomeRequestValidationException homeRequestValidationException)
        {
            return BadRequest(homeRequestValidationException.InnerException);
        }
        catch (HomeRequestDependencyValidationException homeRequestDependencyValidationException)
            when (homeRequestDependencyValidationException.InnerException is NotFoundHomeRequestException)
        {
            return NotFound(homeRequestDependencyValidationException.InnerException);
        }
        catch (HomeRequestDependencyValidationException homeRequestDependencyValidationException)
        {
            return BadRequest(homeRequestDependencyValidationException.InnerException);
        }
        catch (HomeRequestDependencyException homeRequestDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, homeRequestDependencyException.InnerException);
        }
        catch (HomeRequestServiceException homeRequestServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, homeRequestServiceException.InnerException);
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<HomeRequest>> DeleteHomeRequestByIdAsync(Guid id)
    {
        try
        {
            HomeRequest deletedHomeRequest = await this.homeRequestService.RemoveHomeRequestByIdAsync(id);
            return Ok(deletedHomeRequest);
        }
        catch (HomeRequestValidationException homeRequestValidationException)
        {
            return BadRequest(homeRequestValidationException.InnerException);
        }
        catch (HomeRequestDependencyValidationException homeRequestDependencyValidationException)
            when (homeRequestDependencyValidationException.InnerException is NotFoundHomeRequestException)
        {
            return NotFound(homeRequestDependencyValidationException.InnerException);
        }
        catch (HomeRequestDependencyValidationException homeRequestDependencyValidationException)
        {
            return BadRequest(homeRequestDependencyValidationException.InnerException);
        }
        catch (HomeRequestDependencyException homeRequestDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, homeRequestDependencyException.InnerException);
        }
        catch (HomeRequestServiceException homeRequestServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, homeRequestServiceException.InnerException);
        }
    }
}
