#nullable disable

using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
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
        public async Task<ActionResult<PagedResult<Booking>>> GetAllBookings([FromQuery] PaginationParams pagination)
        {
            try
            {
                IQueryable<Booking> query = this.bookingService.RetrieveAllBookings();

                var countTask = query.CountAsync();
                var itemsTask = query
                    .Skip((pagination.Page - 1) * pagination.PageSize)
                    .Take(pagination.PageSize)
                    .ToListAsync();

                await Task.WhenAll(countTask, itemsTask);

                var result = new PagedResult<Booking>
                {
                    Items = itemsTask.Result,
                    TotalCount = countTask.Result,
                    Page = pagination.Page,
                    PageSize = pagination.PageSize
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
        public async Task<ActionResult<PagedResult<Booking>>> GetMyBookings([FromQuery] PaginationParams pagination)
        {
            try
            {
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                    return Unauthorized();

                IQueryable<Booking> query = this.bookingService.RetrieveAllBookings()
                    .Where(b => b.GuestId == currentUserId);

                var countTask = query.CountAsync();
                var itemsTask = query
                    .Skip((pagination.Page - 1) * pagination.PageSize)
                    .Take(pagination.PageSize)
                    .ToListAsync();

                await Task.WhenAll(countTask, itemsTask);

                var result = new PagedResult<Booking>
                {
                    Items = itemsTask.Result,
                    TotalCount = countTask.Result,
                    Page = pagination.Page,
                    PageSize = pagination.PageSize
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
        public async Task<ActionResult<PagedResult<Booking>>> GetHostBookings([FromQuery] PaginationParams pagination)
        {
            try
            {
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                    return Unauthorized();

                IQueryable<Booking> query = this.bookingService.RetrieveAllBookings()
                    .Where(b => b.Property.HostId == currentUserId);

                var countTask = query.CountAsync();
                var itemsTask = query
                    .Skip((pagination.Page - 1) * pagination.PageSize)
                    .Take(pagination.PageSize)
                    .ToListAsync();

                await Task.WhenAll(countTask, itemsTask);

                var result = new PagedResult<Booking>
                {
                    Items = itemsTask.Result,
                    TotalCount = countTask.Result,
                    Page = pagination.Page,
                    PageSize = pagination.PageSize
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
        public async ValueTask<ActionResult<Booking>> GetBookingByIdAsync(Guid id)
        {
            try
            {
                Booking booking = await this.bookingService.RetrieveBookingByIdAsync(id);
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
        public async ValueTask<ActionResult<Booking>> PostBookingAsync(Booking booking)
        {
            try
            {
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                    return Unauthorized();

                booking.GuestId = currentUserId;
                Booking createdBooking = await this.bookingService.AddBookingAsync(booking);

                return CreatedAtAction(nameof(GetBookingByIdAsync), new { id = createdBooking.Id }, createdBooking);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Internal server error." });
            }
        }

        [HttpPost("{id}/confirm")]
        [Authorize(Roles = "Host,Admin")]
        public async ValueTask<ActionResult<Booking>> ConfirmBookingAsync(Guid id)
        {
            try
            {
                Booking booking = await this.bookingService.RetrieveBookingByIdAsync(id);

                if (booking.Status != BookingStatus.Pending)
                    return BadRequest(new { message = "Only pending bookings can be confirmed." });

                booking.Status = BookingStatus.Confirmed;
                Booking updatedBooking = await this.bookingService.ModifyBookingAsync(booking);

                return Ok(updatedBooking);
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

        [HttpPost("{id}/cancel")]
        [Authorize]
        public async ValueTask<ActionResult<Booking>> CancelBookingAsync(Guid id)
        {
            try
            {
                Booking booking = await this.bookingService.RetrieveBookingByIdAsync(id);

                if (booking.Status == BookingStatus.Cancelled)
                    return BadRequest(new { message = "Booking is already cancelled." });

                if (booking.Status == BookingStatus.Completed)
                    return BadRequest(new { message = "Completed bookings cannot be cancelled." });

                booking.Status = BookingStatus.Cancelled;
                Booking updatedBooking = await this.bookingService.ModifyBookingAsync(booking);

                return Ok(updatedBooking);
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

        [HttpPut]
        [Authorize]
        public async ValueTask<ActionResult<Booking>> PutBookingAsync(Booking booking)
        {
            try
            {
                Booking updatedBooking = await this.bookingService.ModifyBookingAsync(booking);
                return Ok(updatedBooking);
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

        [HttpDelete("{id}")]
        [Authorize]
        public async ValueTask<ActionResult<Booking>> DeleteBookingAsync(Guid id)
        {
            try
            {
                Booking deletedBooking = await this.bookingService.RemoveBookingAsync(id);
                return Ok(deletedBooking);
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
    }
}
