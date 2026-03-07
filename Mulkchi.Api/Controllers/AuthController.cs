using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Auth;
using Mulkchi.Api.Models.Foundations.Auth.Exceptions;
using Mulkchi.Api.Services.Foundations.Auth;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService authService;

    public AuthController(IAuthService authService)
    {
        this.authService = authService;
    }

    [HttpPost("login")]
    public async ValueTask<ActionResult<AuthResponse>> LoginAsync(LoginRequest request)
    {
        try
        {
            AuthResponse response = await this.authService.LoginAsync(request);
            return Ok(response);
        }
        catch (AuthValidationException authValidationException)
        {
            return BadRequest(authValidationException.InnerException);
        }
        catch (AuthDependencyValidationException authDependencyValidationException)
            when (authDependencyValidationException.InnerException is NotFoundUserByEmailException)
        {
            return NotFound(authDependencyValidationException.InnerException);
        }
        catch (AuthDependencyValidationException authDependencyValidationException)
        {
            return BadRequest(authDependencyValidationException.InnerException);
        }
        catch (AuthDependencyException authDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, authDependencyException.InnerException);
        }
        catch (AuthServiceException authServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, authServiceException.InnerException);
        }
    }

    [HttpPost("register")]
    public async ValueTask<ActionResult<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        try
        {
            AuthResponse response = await this.authService.RegisterAsync(request);
            return Created("auth/register", response);
        }
        catch (AuthValidationException authValidationException)
        {
            return BadRequest(authValidationException.InnerException);
        }
        catch (AuthDependencyValidationException authDependencyValidationException)
            when (authDependencyValidationException.InnerException is AlreadyExistsUserEmailException)
        {
            return Conflict(authDependencyValidationException.InnerException);
        }
        catch (AuthDependencyValidationException authDependencyValidationException)
        {
            return BadRequest(authDependencyValidationException.InnerException);
        }
        catch (AuthDependencyException authDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, authDependencyException.InnerException);
        }
        catch (AuthServiceException authServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, authServiceException.InnerException);
        }
    }

    [HttpPost("refresh")]
    public async ValueTask<ActionResult<AuthResponse>> RefreshTokenAsync([FromBody] string refreshToken)
    {
        try
        {
            AuthResponse response = await this.authService.RefreshTokenAsync(refreshToken);
            return Ok(response);
        }
        catch (AuthValidationException authValidationException)
        {
            return BadRequest(authValidationException.InnerException);
        }
        catch (AuthDependencyValidationException authDependencyValidationException)
            when (authDependencyValidationException.InnerException is NotFoundUserByEmailException)
        {
            return NotFound(authDependencyValidationException.InnerException);
        }
        catch (AuthDependencyValidationException authDependencyValidationException)
        {
            return BadRequest(authDependencyValidationException.InnerException);
        }
        catch (AuthDependencyException authDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, authDependencyException.InnerException);
        }
        catch (AuthServiceException authServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, authServiceException.InnerException);
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async ValueTask<ActionResult> LogoutAsync([FromBody] string refreshToken)
    {
        try
        {
            await this.authService.LogoutAsync(refreshToken);
            return NoContent();
        }
        catch (AuthValidationException authValidationException)
        {
            return BadRequest(authValidationException.InnerException);
        }
        catch (AuthDependencyException authDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, authDependencyException.InnerException);
        }
        catch (AuthServiceException authServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, authServiceException.InnerException);
        }
    }
}
