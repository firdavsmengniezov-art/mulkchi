using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Common;
using Mulkchi.Api.Models.Foundations.Payments;
using Mulkchi.Api.Models.Foundations.Payments.Exceptions;
using Mulkchi.Api.Services.Foundations.Payments;
using System.Security.Claims;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        this.paymentService = paymentService;
    }

    [HttpPost]
    [Authorize]
    public async ValueTask<ActionResult<Payment>> PostPaymentAsync(Payment payment)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                return Unauthorized();

            // Idempotency: if the client supplies X-Idempotency-Key and we already
            // processed a payment with that key, return the original result instead of
            // charging twice (safe to replay on network retries).
            var idempotencyKey = Request.Headers["X-Idempotency-Key"].FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(idempotencyKey))
            {
                Payment? existing = await this.paymentService.RetrievePaymentByIdempotencyKeyAsync(idempotencyKey);
                if (existing is not null)
                    return Ok(existing);

                payment.IdempotencyKey = idempotencyKey;
            }

            payment.PayerId = currentUserId;
            Payment addedPayment = await this.paymentService.AddPaymentAsync(payment);
            return Created("payment", addedPayment);
        }
        catch (PaymentValidationException paymentValidationException)
        {
            return BadRequest(new { message = paymentValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PaymentDependencyValidationException paymentDependencyValidationException)
        {
            return BadRequest(new { message = paymentDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PaymentDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (PaymentServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpGet]
    [Authorize]
    public ActionResult<PagedResult<Payment>> GetAllPayments([FromQuery] PaginationParams pagination)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid userId))
                return Unauthorized();

            var isAdmin = User.IsInRole("Admin");
            IQueryable<Payment> query = isAdmin
                ? this.paymentService.RetrieveAllPayments()
                : this.paymentService.RetrieveAllPayments().Where(p => p.PayerId == userId || p.ReceiverId == userId);

            int totalCount = query.Count();

            var items = query
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToList();

            var result = new PagedResult<Payment>
            {
                Items = items,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };

            return Ok(result);
        }
        catch (PaymentDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (PaymentServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<Payment>> GetPaymentByIdAsync(Guid id)
    {
        try
        {
            Payment payment = await this.paymentService.RetrievePaymentByIdAsync(id);
            return Ok(payment);
        }
        catch (PaymentValidationException paymentValidationException)
        {
            return BadRequest(new { message = paymentValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PaymentDependencyValidationException paymentDependencyValidationException)
            when (paymentDependencyValidationException.InnerException is NotFoundPaymentException)
        {
            return NotFound(new { message = paymentDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PaymentDependencyValidationException paymentDependencyValidationException)
        {
            return BadRequest(new { message = paymentDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PaymentDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (PaymentServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpPut]
    [Authorize]
    public async ValueTask<ActionResult<Payment>> PutPaymentAsync(Payment payment)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                return Unauthorized();

            bool isAdmin = User.IsInRole("Admin");
            if (!isAdmin)
            {
                Payment existingPayment = await this.paymentService.RetrievePaymentByIdAsync(payment.Id);
                if (existingPayment is null)
                    return NotFound(new { message = "Payment not found." });

                if (existingPayment.PayerId != currentUserId)
                    return Forbid();
            }

            Payment modifiedPayment = await this.paymentService.ModifyPaymentAsync(payment);
            return Ok(modifiedPayment);
        }
        catch (PaymentValidationException paymentValidationException)
        {
            return BadRequest(new { message = paymentValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PaymentDependencyValidationException paymentDependencyValidationException)
            when (paymentDependencyValidationException.InnerException is NotFoundPaymentException)
        {
            return NotFound(new { message = paymentDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PaymentDependencyValidationException paymentDependencyValidationException)
        {
            return BadRequest(new { message = paymentDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PaymentDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (PaymentServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async ValueTask<ActionResult<Payment>> DeletePaymentByIdAsync(Guid id)
    {
        try
        {
            Payment deletedPayment = await this.paymentService.RemovePaymentByIdAsync(id);
            return Ok(deletedPayment);
        }
        catch (PaymentValidationException paymentValidationException)
        {
            return BadRequest(new { message = paymentValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PaymentDependencyValidationException paymentDependencyValidationException)
            when (paymentDependencyValidationException.InnerException is NotFoundPaymentException)
        {
            return NotFound(new { message = paymentDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PaymentDependencyValidationException paymentDependencyValidationException)
        {
            return BadRequest(new { message = paymentDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PaymentDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (PaymentServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }
}
