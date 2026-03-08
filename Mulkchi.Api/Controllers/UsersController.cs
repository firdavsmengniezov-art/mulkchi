using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    public ActionResult<IQueryable<User>> GetAllUsers()
    {
        try
        {
            IQueryable<User> users = this.userService.RetrieveAllUsers();
            return Ok(users);
        }
        catch (UserDependencyException userDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, userDependencyException.InnerException);
        }
        catch (UserServiceException userServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, userServiceException.InnerException);
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
            return BadRequest(userValidationException.InnerException);
        }
        catch (UserDependencyValidationException userDependencyValidationException)
            when (userDependencyValidationException.InnerException is NotFoundUserException)
        {
            return NotFound(userDependencyValidationException.InnerException);
        }
        catch (UserDependencyValidationException userDependencyValidationException)
        {
            return BadRequest(userDependencyValidationException.InnerException);
        }
        catch (UserDependencyException userDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, userDependencyException.InnerException);
        }
        catch (UserServiceException userServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, userServiceException.InnerException);
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

            User modifiedUser = await this.userService.ModifyUserAsync(user);
            return Ok(modifiedUser);
        }
        catch (UserValidationException userValidationException)
        {
            return BadRequest(userValidationException.InnerException);
        }
        catch (UserDependencyValidationException userDependencyValidationException)
            when (userDependencyValidationException.InnerException is NotFoundUserException)
        {
            return NotFound(userDependencyValidationException.InnerException);
        }
        catch (UserDependencyValidationException userDependencyValidationException)
        {
            return BadRequest(userDependencyValidationException.InnerException);
        }
        catch (UserDependencyException userDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, userDependencyException.InnerException);
        }
        catch (UserServiceException userServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, userServiceException.InnerException);
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
            return BadRequest(userValidationException.InnerException);
        }
        catch (UserDependencyValidationException userDependencyValidationException)
            when (userDependencyValidationException.InnerException is NotFoundUserException)
        {
            return NotFound(userDependencyValidationException.InnerException);
        }
        catch (UserDependencyValidationException userDependencyValidationException)
        {
            return BadRequest(userDependencyValidationException.InnerException);
        }
        catch (UserDependencyException userDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, userDependencyException.InnerException);
        }
        catch (UserServiceException userServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, userServiceException.InnerException);
        }
    }
}
