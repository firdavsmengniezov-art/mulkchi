using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.PropertyImages;
using Mulkchi.Api.Models.Foundations.PropertyImages.Exceptions;
using Mulkchi.Api.Services.Foundations.PropertyImages;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PropertyImagesController : ControllerBase
{
    private readonly IPropertyImageService propertyImageService;

    public PropertyImagesController(IPropertyImageService propertyImageService)
    {
        this.propertyImageService = propertyImageService;
    }

    [HttpPost]
    [Authorize]
    public async ValueTask<ActionResult<PropertyImage>> PostPropertyImageAsync(PropertyImage propertyImage)
    {
        try
        {
            PropertyImage addedPropertyImage = await this.propertyImageService.AddPropertyImageAsync(propertyImage);
            return Created("propertyImage", addedPropertyImage);
        }
        catch (PropertyImageValidationException propertyImageValidationException)
        {
            return BadRequest(propertyImageValidationException.InnerException);
        }
        catch (PropertyImageDependencyValidationException propertyImageDependencyValidationException)
        {
            return BadRequest(propertyImageDependencyValidationException.InnerException);
        }
        catch (PropertyImageDependencyException propertyImageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyImageDependencyException.InnerException);
        }
        catch (PropertyImageServiceException propertyImageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyImageServiceException.InnerException);
        }
    }

    [HttpGet]
    [Authorize]
    public ActionResult<IQueryable<PropertyImage>> GetAllPropertyImages()
    {
        try
        {
            IQueryable<PropertyImage> propertyImages = this.propertyImageService.RetrieveAllPropertyImages();
            return Ok(propertyImages);
        }
        catch (PropertyImageDependencyException propertyImageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyImageDependencyException.InnerException);
        }
        catch (PropertyImageServiceException propertyImageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyImageServiceException.InnerException);
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<PropertyImage>> GetPropertyImageByIdAsync(Guid id)
    {
        try
        {
            PropertyImage propertyImage = await this.propertyImageService.RetrievePropertyImageByIdAsync(id);
            return Ok(propertyImage);
        }
        catch (PropertyImageValidationException propertyImageValidationException)
        {
            return BadRequest(propertyImageValidationException.InnerException);
        }
        catch (PropertyImageDependencyValidationException propertyImageDependencyValidationException)
            when (propertyImageDependencyValidationException.InnerException is NotFoundPropertyImageException)
        {
            return NotFound(propertyImageDependencyValidationException.InnerException);
        }
        catch (PropertyImageDependencyValidationException propertyImageDependencyValidationException)
        {
            return BadRequest(propertyImageDependencyValidationException.InnerException);
        }
        catch (PropertyImageDependencyException propertyImageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyImageDependencyException.InnerException);
        }
        catch (PropertyImageServiceException propertyImageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyImageServiceException.InnerException);
        }
    }

    [HttpPut]
    [Authorize]
    public async ValueTask<ActionResult<PropertyImage>> PutPropertyImageAsync(PropertyImage propertyImage)
    {
        try
        {
            PropertyImage modifiedPropertyImage = await this.propertyImageService.ModifyPropertyImageAsync(propertyImage);
            return Ok(modifiedPropertyImage);
        }
        catch (PropertyImageValidationException propertyImageValidationException)
        {
            return BadRequest(propertyImageValidationException.InnerException);
        }
        catch (PropertyImageDependencyValidationException propertyImageDependencyValidationException)
            when (propertyImageDependencyValidationException.InnerException is NotFoundPropertyImageException)
        {
            return NotFound(propertyImageDependencyValidationException.InnerException);
        }
        catch (PropertyImageDependencyValidationException propertyImageDependencyValidationException)
        {
            return BadRequest(propertyImageDependencyValidationException.InnerException);
        }
        catch (PropertyImageDependencyException propertyImageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyImageDependencyException.InnerException);
        }
        catch (PropertyImageServiceException propertyImageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyImageServiceException.InnerException);
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<PropertyImage>> DeletePropertyImageByIdAsync(Guid id)
    {
        try
        {
            PropertyImage deletedPropertyImage = await this.propertyImageService.RemovePropertyImageByIdAsync(id);
            return Ok(deletedPropertyImage);
        }
        catch (PropertyImageValidationException propertyImageValidationException)
        {
            return BadRequest(propertyImageValidationException.InnerException);
        }
        catch (PropertyImageDependencyValidationException propertyImageDependencyValidationException)
            when (propertyImageDependencyValidationException.InnerException is NotFoundPropertyImageException)
        {
            return NotFound(propertyImageDependencyValidationException.InnerException);
        }
        catch (PropertyImageDependencyValidationException propertyImageDependencyValidationException)
        {
            return BadRequest(propertyImageDependencyValidationException.InnerException);
        }
        catch (PropertyImageDependencyException propertyImageDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyImageDependencyException.InnerException);
        }
        catch (PropertyImageServiceException propertyImageServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, propertyImageServiceException.InnerException);
        }
    }
}
