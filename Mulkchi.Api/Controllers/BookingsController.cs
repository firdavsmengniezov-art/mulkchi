#nullable disable

using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Mulkchi.Api.Models.Foundations.Bookings;
using Mulkchi.Api.Models.Foundations.Common;
using Mulkchi.Api.Services.Foundations.Bookings;

namespace Mulkchi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService bookingService;

        public BookingsController(IBookingService bookingService) =>
            this.bookingService = bookingService;

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<PagedResult<BookingResponse>>> GetAllBookings([FromQuery] BookingQueryParams queryParams)
        {
            try
            {
                // Admin can view all if needed, mapped inside service
                var (items, total) = await this.bookingService.RetrieveBookingsAsync(queryParams);

                var result = new PagedResult<BookingResponse>
                {
                    Items = items,
                    TotalCount = total,
                    Page = queryParams.Page,
                    PageSize = queryParams.PageSize
                };

                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Internal server error." });
            }
        }

        [HttpGet("my")]
        [Authorize]
        public async Task<ActionResult<PagedResult<BookingResponse>>> GetMyBookings([FromQuery] BookingQueryParams queryParams)
        {
            try
            {
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                    return Unauthorized();

                queryParams.UserId = currentUserId; // Set internally for Guest lookup
                queryParams.IsHostView = false;
                
                var (items, total) = await this.bookingService.RetrieveBookingsAsync(queryParams);

                var result = new PagedResult<BookingResponse>
                {
                    Items = items,
                    TotalCount = total,
                    Page = queryParams.Page,
                    PageSize = queryParams.PageSize
                };

                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Internal server error." });
            }
        }

        [HttpGet("host")]
        [Authorize(Roles = "Host,Admin")]
        public async Task<ActionResult<PagedResult<BookingResponse>>> GetHostBookings([FromQuery] BookingQueryParams queryParams)
        {
            try
            {
                queryParams.IsHostView = true; // Tell service to filter by Host
                
                var (items, total) = await this.bookingService.RetrieveBookingsAsync(queryParams);

                var result = new PagedResult<BookingResponse>
                {
                    Items = items,
                    TotalCount = total,
                    Page = queryParams.Page,
                    PageSize = queryParams.PageSize
                };

                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Internal server error." });
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async ValueTask<ActionResult<BookingResponse>> GetBookingByIdAsync(Guid id)
        {
            try
            {
                var booking = await this.bookingService.RetrieveBookingByIdAsync(id);
                return Ok(booking);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Internal server error." });
            }
        }

        [HttpPost]
        [Authorize]
        public async ValueTask<ActionResult<BookingResponse>> PostBookingAsync([FromBody] BookingCreateDto dto)
        {
            try
            {
                var createdBooking = await this.bookingService.AddBookingAsync(dto);
                return CreatedAtAction(nameof(GetBookingByIdAsync), new { id = createdBooking.Id }, createdBooking);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Internal server error." });
            }
        }

        [HttpPost("{id}/confirm")]
        [Authorize(Roles = "Host,Admin")]
        public async ValueTask<ActionResult<BookingResponse>> ConfirmBookingAsync(Guid id)
        {
            try
            {
                var confirmedBooking = await this.bookingService.ConfirmBookingAsync(id);
                return Ok(confirmedBooking);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Internal server error." });
            }
        }

        [HttpPost("{id}/cancel")]
        [Authorize]
        public async ValueTask<ActionResult<BookingResponse>> CancelBookingAsync(Guid id)
        {
            try
            {
                var cancelledBooking = await this.bookingService.CancelBookingAsync(id);
                return Ok(cancelledBooking);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Internal server error." });
            }
        }

        [HttpGet("availability/{propertyId}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetPropertyAvailability(Guid propertyId, [FromQuery] int year, [FromQuery] int month)
        {
            try
            {
                if (year <= 0) year = DateTimeOffset.UtcNow.Year;
                if (month <= 0 || month > 12) month = DateTimeOffset.UtcNow.Month;

                var blocked = await this.bookingService.RetrieveBlockedDatesAsync(propertyId, year, month);
                var blockedStrings = blocked.Select(d => d.ToString("yyyy-MM-dd")).ToList();

                return Ok(new { propertyId, year, month, blockedDates = blockedStrings });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Internal server error." });
            }
        }
    }
}
