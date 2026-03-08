using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Common;
using Mulkchi.Api.Models.Foundations.RentalContracts;
using Mulkchi.Api.Models.Foundations.RentalContracts.Exceptions;
using Mulkchi.Api.Services.Foundations.RentalContracts;
using System.Security.Claims;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RentalContractsController : ControllerBase
{
    private readonly IRentalContractService rentalContractService;

    public RentalContractsController(IRentalContractService rentalContractService)
    {
        this.rentalContractService = rentalContractService;
    }

    [HttpPost]
    [Authorize]
    public async ValueTask<ActionResult<RentalContract>> PostRentalContractAsync(RentalContract rentalContract)
    {
        try
        {
            RentalContract addedRentalContract = await this.rentalContractService.AddRentalContractAsync(rentalContract);
            return Created("rentalContract", addedRentalContract);
        }
        catch (RentalContractValidationException rentalContractValidationException)
        {
            return BadRequest(rentalContractValidationException.InnerException);
        }
        catch (RentalContractDependencyValidationException rentalContractDependencyValidationException)
        {
            return BadRequest(rentalContractDependencyValidationException.InnerException);
        }
        catch (RentalContractDependencyException rentalContractDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, rentalContractDependencyException.InnerException);
        }
        catch (RentalContractServiceException rentalContractServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, rentalContractServiceException.InnerException);
        }
    }

    [HttpGet]
    [Authorize]
    public ActionResult<PagedResult<RentalContract>> GetAllRentalContracts([FromQuery] PaginationParams pagination)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid userId))
                return Unauthorized();

            var isAdmin = User.IsInRole("Admin");
            IQueryable<RentalContract> query = isAdmin
                ? this.rentalContractService.RetrieveAllRentalContracts()
                : this.rentalContractService.RetrieveAllRentalContracts().Where(r => r.TenantId == userId || r.LandlordId == userId);

            int totalCount = query.Count();

            var items = query
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToList();

            var result = new PagedResult<RentalContract>
            {
                Items = items,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };

            return Ok(result);
        }
        catch (RentalContractDependencyException rentalContractDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, rentalContractDependencyException.InnerException);
        }
        catch (RentalContractServiceException rentalContractServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, rentalContractServiceException.InnerException);
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<RentalContract>> GetRentalContractByIdAsync(Guid id)
    {
        try
        {
            RentalContract rentalContract = await this.rentalContractService.RetrieveRentalContractByIdAsync(id);
            return Ok(rentalContract);
        }
        catch (RentalContractValidationException rentalContractValidationException)
        {
            return BadRequest(rentalContractValidationException.InnerException);
        }
        catch (RentalContractDependencyValidationException rentalContractDependencyValidationException)
            when (rentalContractDependencyValidationException.InnerException is NotFoundRentalContractException)
        {
            return NotFound(rentalContractDependencyValidationException.InnerException);
        }
        catch (RentalContractDependencyValidationException rentalContractDependencyValidationException)
        {
            return BadRequest(rentalContractDependencyValidationException.InnerException);
        }
        catch (RentalContractDependencyException rentalContractDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, rentalContractDependencyException.InnerException);
        }
        catch (RentalContractServiceException rentalContractServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, rentalContractServiceException.InnerException);
        }
    }

    [HttpPut]
    [Authorize]
    public async ValueTask<ActionResult<RentalContract>> PutRentalContractAsync(RentalContract rentalContract)
    {
        try
        {
            RentalContract modifiedRentalContract = await this.rentalContractService.ModifyRentalContractAsync(rentalContract);
            return Ok(modifiedRentalContract);
        }
        catch (RentalContractValidationException rentalContractValidationException)
        {
            return BadRequest(rentalContractValidationException.InnerException);
        }
        catch (RentalContractDependencyValidationException rentalContractDependencyValidationException)
            when (rentalContractDependencyValidationException.InnerException is NotFoundRentalContractException)
        {
            return NotFound(rentalContractDependencyValidationException.InnerException);
        }
        catch (RentalContractDependencyValidationException rentalContractDependencyValidationException)
        {
            return BadRequest(rentalContractDependencyValidationException.InnerException);
        }
        catch (RentalContractDependencyException rentalContractDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, rentalContractDependencyException.InnerException);
        }
        catch (RentalContractServiceException rentalContractServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, rentalContractServiceException.InnerException);
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<RentalContract>> DeleteRentalContractByIdAsync(Guid id)
    {
        try
        {
            RentalContract deletedRentalContract = await this.rentalContractService.RemoveRentalContractByIdAsync(id);
            return Ok(deletedRentalContract);
        }
        catch (RentalContractValidationException rentalContractValidationException)
        {
            return BadRequest(rentalContractValidationException.InnerException);
        }
        catch (RentalContractDependencyValidationException rentalContractDependencyValidationException)
            when (rentalContractDependencyValidationException.InnerException is NotFoundRentalContractException)
        {
            return NotFound(rentalContractDependencyValidationException.InnerException);
        }
        catch (RentalContractDependencyValidationException rentalContractDependencyValidationException)
        {
            return BadRequest(rentalContractDependencyValidationException.InnerException);
        }
        catch (RentalContractDependencyException rentalContractDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, rentalContractDependencyException.InnerException);
        }
        catch (RentalContractServiceException rentalContractServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, rentalContractServiceException.InnerException);
        }
    }
}
