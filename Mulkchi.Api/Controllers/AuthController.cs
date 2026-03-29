using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Auth;
using Mulkchi.Api.Models.Foundations.Auth.Exceptions;
using Mulkchi.Api.Models.Foundations.Users;
using Mulkchi.Api.Services.Foundations.Auth;
using System.Security.Claims;

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
            return BadRequest(new { message = authValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AuthDependencyValidationException authDependencyValidationException)
            when (authDependencyValidationException.InnerException is NotFoundUserByEmailException)
        {
            return NotFound(new { message = authDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AuthDependencyValidationException authDependencyValidationException)
        {
            return BadRequest(new { message = authDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AuthDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (AuthServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
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
            return BadRequest(new { message = authValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AuthDependencyValidationException authDependencyValidationException)
            when (authDependencyValidationException.InnerException is AlreadyExistsUserEmailException)
        {
            return Conflict(new { message = authDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AuthDependencyValidationException authDependencyValidationException)
        {
            return BadRequest(new { message = authDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AuthDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (AuthServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpPost("refresh-token")]
    public async ValueTask<ActionResult<AuthResponse>> RefreshTokenAsync([FromBody] string refreshToken)
    {
        try
        {
            AuthResponse response = await this.authService.RefreshTokenAsync(refreshToken);
            return Ok(response);
        }
        catch (AuthValidationException authValidationException)
        {
            return BadRequest(new { message = authValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AuthDependencyValidationException authDependencyValidationException)
            when (authDependencyValidationException.InnerException is NotFoundUserByEmailException)
        {
            return NotFound(new { message = authDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AuthDependencyValidationException authDependencyValidationException)
        {
            return BadRequest(new { message = authDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AuthDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (AuthServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
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
            return BadRequest(new { message = authValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AuthDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (AuthServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpPost("forgot-password")]
    public async ValueTask<ActionResult> ForgotPasswordAsync([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            await this.authService.ForgotPasswordAsync(request.Email);
            return Ok(new { message = "If an account with that email exists, a password reset link has been sent." });
        }
        catch (AuthValidationException authValidationException)
        {
            return BadRequest(new { message = authValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AuthDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (AuthServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpPost("reset-password")]
    public async ValueTask<ActionResult> ResetPasswordAsync([FromBody] ResetPasswordRequest request)
    {
        try
        {
            await this.authService.ResetPasswordAsync(request.Token, request.NewPassword);
            return Ok(new { message = "Password has been reset successfully." });
        }
        catch (AuthValidationException authValidationException)
        {
            return BadRequest(new { message = authValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (AuthDependencyValidationException authDependencyValidationException)
            when (authDependencyValidationException.InnerException is NotFoundPasswordResetTokenException)
        {
            return BadRequest(new { message = "Invalid or expired reset token." });
        }
        catch (AuthDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (AuthServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    // GET /api/auth/me - joriy foydalanuvchi ma'lumotlari
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(User), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async ValueTask<ActionResult<User>> GetCurrentUserAsync()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
            return Unauthorized();

        var user = await this.authService.RetrieveUserByIdAsync(currentUserId);
        return Ok(user);
    }

    // PUT /api/auth/profile - profil yangilash
    [HttpPut("profile")]
    [Authorize]
    [ProducesResponseType(typeof(User), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async ValueTask<ActionResult<User>> UpdateProfileAsync([FromBody] UpdateProfileRequest request)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
            return Unauthorized();

        var updatedUser = await this.authService.ModifyUserProfileAsync(currentUserId, request);
        return Ok(updatedUser);
    }

    // DELETE /api/auth/account - hisobni o'chirish
    [HttpDelete("account")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async ValueTask<ActionResult> DeleteAccountAsync()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
            return Unauthorized();

        await this.authService.RemoveUserByIdAsync(currentUserId);
        return Ok(new { message = "Hisob muvaffaqiyatli o'chirildi." });
    }
}
