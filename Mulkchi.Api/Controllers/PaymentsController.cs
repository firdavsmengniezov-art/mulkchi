using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Payments;
using Mulkchi.Api.Models.Foundations.Payments.Exceptions;
using Mulkchi.Api.Services.Foundations.Payments;

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
            Payment addedPayment = await this.paymentService.AddPaymentAsync(payment);
            return Created("payment", addedPayment);
        }
        catch (PaymentValidationException paymentValidationException)
        {
            return BadRequest(paymentValidationException.InnerException);
        }
        catch (PaymentDependencyValidationException paymentDependencyValidationException)
        {
            return BadRequest(paymentDependencyValidationException.InnerException);
        }
        catch (PaymentDependencyException paymentDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, paymentDependencyException.InnerException);
        }
        catch (PaymentServiceException paymentServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, paymentServiceException.InnerException);
        }
    }

    [HttpGet]
    [Authorize]
    public ActionResult<IQueryable<Payment>> GetAllPayments()
    {
        try
        {
            IQueryable<Payment> payments = this.paymentService.RetrieveAllPayments();
            return Ok(payments);
        }
        catch (PaymentDependencyException paymentDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, paymentDependencyException.InnerException);
        }
        catch (PaymentServiceException paymentServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, paymentServiceException.InnerException);
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
            return BadRequest(paymentValidationException.InnerException);
        }
        catch (PaymentDependencyValidationException paymentDependencyValidationException)
            when (paymentDependencyValidationException.InnerException is NotFoundPaymentException)
        {
            return NotFound(paymentDependencyValidationException.InnerException);
        }
        catch (PaymentDependencyValidationException paymentDependencyValidationException)
        {
            return BadRequest(paymentDependencyValidationException.InnerException);
        }
        catch (PaymentDependencyException paymentDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, paymentDependencyException.InnerException);
        }
        catch (PaymentServiceException paymentServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, paymentServiceException.InnerException);
        }
    }

    [HttpPut]
    [Authorize]
    public async ValueTask<ActionResult<Payment>> PutPaymentAsync(Payment payment)
    {
        try
        {
            Payment modifiedPayment = await this.paymentService.ModifyPaymentAsync(payment);
            return Ok(modifiedPayment);
        }
        catch (PaymentValidationException paymentValidationException)
        {
            return BadRequest(paymentValidationException.InnerException);
        }
        catch (PaymentDependencyValidationException paymentDependencyValidationException)
            when (paymentDependencyValidationException.InnerException is NotFoundPaymentException)
        {
            return NotFound(paymentDependencyValidationException.InnerException);
        }
        catch (PaymentDependencyValidationException paymentDependencyValidationException)
        {
            return BadRequest(paymentDependencyValidationException.InnerException);
        }
        catch (PaymentDependencyException paymentDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, paymentDependencyException.InnerException);
        }
        catch (PaymentServiceException paymentServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, paymentServiceException.InnerException);
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
            return BadRequest(paymentValidationException.InnerException);
        }
        catch (PaymentDependencyValidationException paymentDependencyValidationException)
            when (paymentDependencyValidationException.InnerException is NotFoundPaymentException)
        {
            return NotFound(paymentDependencyValidationException.InnerException);
        }
        catch (PaymentDependencyValidationException paymentDependencyValidationException)
        {
            return BadRequest(paymentDependencyValidationException.InnerException);
        }
        catch (PaymentDependencyException paymentDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, paymentDependencyException.InnerException);
        }
        catch (PaymentServiceException paymentServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, paymentServiceException.InnerException);
        }
    }
}
