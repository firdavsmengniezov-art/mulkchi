using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Common;
using Mulkchi.Api.Models.Foundations.Users;
using Mulkchi.Api.Models.Foundations.Users.Exceptions;
using Mulkchi.Api.Services.Foundations.Users;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService userService;

    public UsersController(IUserService userService)
    {
        this.userService = userService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public ActionResult<PagedResult<User>> GetAllUsers([FromQuery] PaginationParams pagination)
    {
        try
        {
            IQueryable<User> query = this.userService.RetrieveAllUsers();
            
            int totalCount = query.Count();
            
            var items = query
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToList();

            var result = new PagedResult<User>
            {
                Items = items,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };

            return Ok(result);
        }
        catch (UserDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (UserServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<User>> GetUserByIdAsync(Guid id)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                return Unauthorized();

            bool isAdmin = User.IsInRole("Admin");
            if (!isAdmin && id != currentUserId)
                return Forbid();

            User user = await this.userService.RetrieveUserByIdAsync(id);
            return Ok(user);
        }
        catch (UserValidationException userValidationException)
        {
            return BadRequest(new { message = userValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (UserDependencyValidationException userDependencyValidationException)
            when (userDependencyValidationException.InnerException is NotFoundUserException)
        {
            return NotFound(new { message = userDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (UserDependencyValidationException userDependencyValidationException)
        {
            return BadRequest(new { message = userDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (UserDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (UserServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpPut]
    [Authorize]
    public async ValueTask<ActionResult<User>> PutUserAsync(User user)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                return Unauthorized();

            bool isAdmin = User.IsInRole("Admin");
            if (!isAdmin && user.Id != currentUserId)
                return Forbid();

            if (!isAdmin)
            {
                User existingUser = await this.userService.RetrieveUserByIdAsync(user.Id);
                user.Role = existingUser.Role;
                user.IsVerified = existingUser.IsVerified;
                user.Badge = existingUser.Badge;
                user.Rating = existingUser.Rating;
                user.ResponseRate = existingUser.ResponseRate;
                user.ResponseTimeMinutes = existingUser.ResponseTimeMinutes;
                user.TotalListings = existingUser.TotalListings;
                user.TotalBookings = existingUser.TotalBookings;
                user.CreatedDate = existingUser.CreatedDate;
            }

            User modifiedUser = await this.userService.ModifyUserAsync(user);
            return Ok(modifiedUser);
        }
        catch (UserValidationException userValidationException)
        {
            return BadRequest(new { message = userValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (UserDependencyValidationException userDependencyValidationException)
            when (userDependencyValidationException.InnerException is NotFoundUserException)
        {
            return NotFound(new { message = userDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (UserDependencyValidationException userDependencyValidationException)
        {
            return BadRequest(new { message = userDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (UserDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (UserServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async ValueTask<ActionResult<User>> DeleteUserByIdAsync(Guid id)
    {
        try
        {
            User deletedUser = await this.userService.RemoveUserByIdAsync(id);
            return Ok(deletedUser);
        }
        catch (UserValidationException userValidationException)
        {
            return BadRequest(new { message = userValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (UserDependencyValidationException userDependencyValidationException)
            when (userDependencyValidationException.InnerException is NotFoundUserException)
        {
            return NotFound(new { message = userDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (UserDependencyValidationException userDependencyValidationException)
        {
            return BadRequest(new { message = userDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (UserDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (UserServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }
}
