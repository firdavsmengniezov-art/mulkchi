using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserResponse>> GetCurrentUserAsync()
    {
        try
        {
            UserResponse userResponse = await this.userService.RetrieveCurrentUserAsync();
            return Ok(userResponse);
        }
        catch (UserDependencyValidationException userDependencyValidationException)
            when (userDependencyValidationException.InnerException is NotFoundUserException)
        {
            return NotFound(userDependencyValidationException.InnerException.Message);
        }
        catch (UserValidationException userValidationException)
        {
            return BadRequest(userValidationException.InnerException.Message);
        }
        catch (UserServiceException userServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, userServiceException.InnerException.Message);
        }
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<ActionResult<UserResponse>> UpdateProfileAsync([FromBody] UserUpdateDto dto)
    {
        try
        {
            UserResponse userResponse = await this.userService.ModifyUserProfileAsync(dto);
            return Ok(userResponse);
        }
        catch (UserDependencyValidationException userDependencyValidationException)
            when (userDependencyValidationException.InnerException is NotFoundUserException)
        {
            return NotFound(userDependencyValidationException.InnerException.Message);
        }
        catch (UserValidationException userValidationException)
        {
            return BadRequest(userValidationException.InnerException.Message);
        }
        catch (UserServiceException userServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, userServiceException.InnerException.Message);
        }
    }

    [HttpPut("me/avatar")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<UserResponse>> UploadAvatarAsync(IFormFile avatarFile)
    {
        try
        {
            UserResponse userResponse = await this.userService.ModifyUserAvatarAsync(avatarFile);
            return Ok(userResponse);
        }
        catch (UserDependencyValidationException userDependencyValidationException)
            when (userDependencyValidationException.InnerException is NotFoundUserException)
        {
            return NotFound(userDependencyValidationException.InnerException.Message);
        }
        catch (UserValidationException userValidationException)
        {
            return BadRequest(userValidationException.InnerException.Message);
        }
        catch (UserServiceException userServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, userServiceException.InnerException.Message);
        }
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<UserResponse>> GetUserByIdAsync(Guid id)
    {
        try
        {
            UserResponse userResponse = await this.userService.RetrieveUserByIdAsync(id);
            return Ok(userResponse);
        }
        catch (UserDependencyValidationException userDependencyValidationException)
            when (userDependencyValidationException.InnerException is NotFoundUserException)
        {
            return NotFound(userDependencyValidationException.InnerException.Message);
        }
        catch (UserValidationException userValidationException)
        {
            return BadRequest(userValidationException.InnerException.Message);
        }
        catch (UserServiceException userServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, userServiceException.InnerException.Message);
        }
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetAllUsersAsync()
    {
        try
        {
            IEnumerable<UserResponse> users = await this.userService.RetrieveAllUsersAsync();
            return Ok(users);
        }
        catch (UserServiceException userServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, userServiceException.InnerException.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteUserAsync(Guid id)
    {
        try
        {
            User removedUser = await this.userService.RemoveUserByIdAsync(id);
            return NoContent();
        }
        catch (UserDependencyValidationException userDependencyValidationException)
            when (userDependencyValidationException.InnerException is NotFoundUserException)
        {
            return NotFound(userDependencyValidationException.InnerException.Message);
        }
        catch (UserValidationException userValidationException)
        {
            return BadRequest(userValidationException.InnerException.Message);
        }
        catch (UserServiceException userServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, userServiceException.InnerException.Message);
        }
    }
}
