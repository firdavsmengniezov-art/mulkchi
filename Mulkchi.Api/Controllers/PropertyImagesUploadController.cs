using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.PropertyImages;
using Mulkchi.Api.Models.Foundations.PropertyImages.Exceptions;
using Mulkchi.Api.Services.Foundations.Properties;
using Mulkchi.Api.Services.Foundations.PropertyImages;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PropertyImagesUploadController : ControllerBase
{
    private readonly IPropertyImageService propertyImageService;
    private readonly IFileStorageBroker fileStorageBroker;
    private readonly IPropertyService propertyService;

    public PropertyImagesUploadController(
        IPropertyImageService propertyImageService,
        IFileStorageBroker fileStorageBroker,
        IPropertyService propertyService)
    {
        this.propertyImageService = propertyImageService;
        this.fileStorageBroker = fileStorageBroker;
        this.propertyService = propertyService;
    }

    [HttpPost("upload")]
    [Authorize(Roles = "Host,Admin")]
    public async Task<ActionResult<PropertyImage>> UploadPropertyImage(IFormFile file, Guid propertyId)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                return Unauthorized();

            ActionResult ownershipResult = await VerifyPropertyOwnershipAsync(propertyId, currentUserId);
            if (ownershipResult is not OkResult)
                return ownershipResult;

            // Upload file only after ownership is verified
            string imageUrl = await fileStorageBroker.UploadImageAsync(file, "property-images");

            // Create PropertyImage record
            var propertyImage = new PropertyImage
            {
                Id = Guid.NewGuid(),
                PropertyId = propertyId,
                Url = imageUrl,
                IsPrimary = false, // Can be updated later
                SortOrder = 0, // Can be updated later
                CreatedDate = DateTimeOffset.UtcNow,
                UpdatedDate = DateTimeOffset.UtcNow
            };

            PropertyImage addedPropertyImage = await propertyImageService.AddPropertyImageAsync(propertyImage);
            return Created($"property-images/{addedPropertyImage.Id}", addedPropertyImage);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (PropertyImageValidationException propertyImageValidationException)
        {
            return BadRequest(new { message = propertyImageValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyImageDependencyValidationException propertyImageDependencyValidationException)
        {
            return BadRequest(new { message = propertyImageDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyImageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "A dependency error occurred." });
        }
        catch (PropertyImageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "A service error occurred." });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Host,Admin")]
    public async Task<ActionResult> DeletePropertyImage(Guid id)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                return Unauthorized();

            PropertyImage propertyImage = await propertyImageService.RetrievePropertyImageByIdAsync(id);
            if (propertyImage == null)
                return NotFound();

            ActionResult ownershipResult = await VerifyPropertyOwnershipAsync(propertyImage.PropertyId, currentUserId);
            if (ownershipResult is not OkResult)
                return ownershipResult;

            // Delete file from storage
            await fileStorageBroker.DeleteImageAsync(propertyImage.Url);

            // Delete record from database
            await propertyImageService.RemovePropertyImageByIdAsync(id);

            return NoContent();
        }
        catch (PropertyImageValidationException propertyImageValidationException)
        {
            return BadRequest(new { message = propertyImageValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyImageDependencyValidationException propertyImageDependencyValidationException)
        {
            return BadRequest(new { message = propertyImageDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyImageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "A dependency error occurred." });
        }
        catch (PropertyImageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "A service error occurred." });
        }
    }

    private async Task<ActionResult> VerifyPropertyOwnershipAsync(Guid propertyId, Guid currentUserId)
    {
        if (User.IsInRole("Admin"))
            return Ok();

        Property property = await this.propertyService.RetrievePropertyByIdAsync(propertyId);
        if (property is null)
            return NotFound(new { message = "Property not found." });

        if (property.HostId != currentUserId)
            return Forbid();

        return Ok();
    }
}
