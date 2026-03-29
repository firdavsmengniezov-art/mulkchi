#nullable disable

using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
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
        public ActionResult<PagedResult<Booking>> GetAllBookings([FromQuery] PaginationParams pagination)
        {
            IQueryable<Booking> query = this.bookingService.RetrieveAllBookings();
            
            int totalCount = query.Count();
            
            var items = query
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToList();

            var result = new PagedResult<Booking>
            {
                Items = items,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async ValueTask<ActionResult<Booking>> GetBookingByIdAsync(Guid id)
        {
            Booking booking = await this.bookingService.RetrieveBookingByIdAsync(id);
            return Ok(booking);
        }

        [HttpPost]
        public async ValueTask<ActionResult<Booking>> PostBookingAsync(Booking booking)
        {
            Booking createdBooking = await this.bookingService.AddBookingAsync(booking);
            return CreatedAtAction(nameof(GetBookingByIdAsync), new { id = createdBooking.Id }, createdBooking);
        }

        [HttpPut]
        public async ValueTask<ActionResult<Booking>> PutBookingAsync(Booking booking)
        {
            Booking updatedBooking = await this.bookingService.ModifyBookingAsync(booking);
            return Ok(updatedBooking);
        }

        [HttpDelete("{id}")]
        public async ValueTask<ActionResult<Booking>> DeleteBookingAsync(Guid id)
        {
            Booking deletedBooking = await this.bookingService.RemoveBookingAsync(id);
            return Ok(deletedBooking);
        }
    }
}