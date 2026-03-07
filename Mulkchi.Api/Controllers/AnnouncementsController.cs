using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Announcements;
using Mulkchi.Api.Models.Foundations.Announcements.Exceptions;
using Mulkchi.Api.Services.Foundations.Announcements;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnnouncementsController : ControllerBase
{
    private readonly IAnnouncementService announcementService;

    public AnnouncementsController(IAnnouncementService announcementService)
    {
        this.announcementService = announcementService;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async ValueTask<ActionResult<Announcement>> PostAnnouncementAsync(Announcement announcement)
    {
        try
        {
            Announcement addedAnnouncement = await this.announcementService.AddAnnouncementAsync(announcement);
            return Created("announcement", addedAnnouncement);
        }
        catch (AnnouncementValidationException announcementValidationException)
        {
            return BadRequest(announcementValidationException.InnerException);
        }
        catch (AnnouncementDependencyValidationException announcementDependencyValidationException)
        {
            return BadRequest(announcementDependencyValidationException.InnerException);
        }
        catch (AnnouncementDependencyException announcementDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, announcementDependencyException.InnerException);
        }
        catch (AnnouncementServiceException announcementServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, announcementServiceException.InnerException);
        }
    }

    [HttpGet]
    [AllowAnonymous]
    public ActionResult<IQueryable<Announcement>> GetAllAnnouncements()
    {
        try
        {
            IQueryable<Announcement> announcements = this.announcementService.RetrieveAllAnnouncements();
            return Ok(announcements);
        }
        catch (AnnouncementDependencyException announcementDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, announcementDependencyException.InnerException);
        }
        catch (AnnouncementServiceException announcementServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, announcementServiceException.InnerException);
        }
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async ValueTask<ActionResult<Announcement>> GetAnnouncementByIdAsync(Guid id)
    {
        try
        {
            Announcement announcement = await this.announcementService.RetrieveAnnouncementByIdAsync(id);
            return Ok(announcement);
        }
        catch (AnnouncementValidationException announcementValidationException)
        {
            return BadRequest(announcementValidationException.InnerException);
        }
        catch (AnnouncementDependencyValidationException announcementDependencyValidationException)
            when (announcementDependencyValidationException.InnerException is NotFoundAnnouncementException)
        {
            return NotFound(announcementDependencyValidationException.InnerException);
        }
        catch (AnnouncementDependencyValidationException announcementDependencyValidationException)
        {
            return BadRequest(announcementDependencyValidationException.InnerException);
        }
        catch (AnnouncementDependencyException announcementDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, announcementDependencyException.InnerException);
        }
        catch (AnnouncementServiceException announcementServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, announcementServiceException.InnerException);
        }
    }

    [HttpPut]
    [Authorize(Roles = "Admin")]
    public async ValueTask<ActionResult<Announcement>> PutAnnouncementAsync(Announcement announcement)
    {
        try
        {
            Announcement modifiedAnnouncement = await this.announcementService.ModifyAnnouncementAsync(announcement);
            return Ok(modifiedAnnouncement);
        }
        catch (AnnouncementValidationException announcementValidationException)
        {
            return BadRequest(announcementValidationException.InnerException);
        }
        catch (AnnouncementDependencyValidationException announcementDependencyValidationException)
            when (announcementDependencyValidationException.InnerException is NotFoundAnnouncementException)
        {
            return NotFound(announcementDependencyValidationException.InnerException);
        }
        catch (AnnouncementDependencyValidationException announcementDependencyValidationException)
        {
            return BadRequest(announcementDependencyValidationException.InnerException);
        }
        catch (AnnouncementDependencyException announcementDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, announcementDependencyException.InnerException);
        }
        catch (AnnouncementServiceException announcementServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, announcementServiceException.InnerException);
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async ValueTask<ActionResult<Announcement>> DeleteAnnouncementByIdAsync(Guid id)
    {
        try
        {
            Announcement deletedAnnouncement = await this.announcementService.RemoveAnnouncementByIdAsync(id);
            return Ok(deletedAnnouncement);
        }
        catch (AnnouncementValidationException announcementValidationException)
        {
            return BadRequest(announcementValidationException.InnerException);
        }
        catch (AnnouncementDependencyValidationException announcementDependencyValidationException)
            when (announcementDependencyValidationException.InnerException is NotFoundAnnouncementException)
        {
            return NotFound(announcementDependencyValidationException.InnerException);
        }
        catch (AnnouncementDependencyValidationException announcementDependencyValidationException)
        {
            return BadRequest(announcementDependencyValidationException.InnerException);
        }
        catch (AnnouncementDependencyException announcementDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, announcementDependencyException.InnerException);
        }
        catch (AnnouncementServiceException announcementServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, announcementServiceException.InnerException);
        }
    }
}
