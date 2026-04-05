const fs = require('fs')

const pathInterface =
	'Mulkchi.Api/Services/Foundations/Bookings/IBookingService.cs'
const contentInterface = `#nullable disable

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mulkchi.Api.Models.Foundations.Bookings;

namespace Mulkchi.Api.Services.Foundations.Bookings
{
    public interface IBookingService
    {
        ValueTask<BookingResponse> AddBookingAsync(BookingCreateDto dto);
        ValueTask<(IEnumerable<BookingResponse> Items, int TotalCount)> RetrieveBookingsAsync(BookingQueryParams queryParams);
        ValueTask<BookingResponse> RetrieveBookingByIdAsync(Guid bookingId);
        ValueTask<BookingResponse> ConfirmBookingAsync(Guid bookingId);
        ValueTask<BookingResponse> CancelBookingAsync(Guid bookingId);
        
        // Legacy methods maintained if internally referenced
        IQueryable<Booking> RetrieveAllBookings();
        ValueTask<Booking> ModifyBookingAsync(Booking booking);
        ValueTask<Booking> RemoveBookingAsync(Guid bookingId);
    }
}
`

const pathService =
	'Mulkchi.Api/Services/Foundations/Bookings/BookingService.cs'
const contentService = `#nullable disable

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Mulkchi.Api.Models.Foundations.Bookings;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Services.Foundations.Auth;
using Mulkchi.Api.Brokers.Notifications;

namespace Mulkchi.Api.Services.Foundations.Bookings
{
    public partial class BookingService : IBookingService
    {
        private readonly IStorageBroker storageBroker;
        private readonly ICurrentUserService currentUserService;
        private readonly IEmailBroker emailBroker;
        private readonly ILogger<BookingService> logger;

        public BookingService(IStorageBroker storageBroker, ICurrentUserService currentUserService, IEmailBroker emailBroker, ILogger<BookingService> logger)
        {
            this.storageBroker = storageBroker;
            this.currentUserService = currentUserService;
            this.emailBroker = emailBroker;
            this.logger = logger;
        }

        public async ValueTask<BookingResponse> AddBookingAsync(BookingCreateDto dto)
        {
            var currentUserId = this.currentUserService.GetCurrentUserId();
            if (!currentUserId.HasValue)
            {
                throw new UnauthorizedAccessException("Current user is missing.");
            }

            var property = await this.storageBroker.SelectPropertyByIdAsync(dto.PropertyId);
            if (property == null)
            {
                throw new ArgumentException("Property not found.");
            }

            var now = DateTimeOffset.UtcNow;
            
            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                PropertyId = dto.PropertyId,
                GuestId = currentUserId.Value,
                CheckInDate = dto.CheckInDate,
                CheckOutDate = dto.CheckOutDate,
                GuestsCount = dto.GuestsCount,
                TotalPrice = dto.TotalPrice,
                Source = dto.Source,
                SpecialRequests = dto.SpecialRequests,
                CreatedDate = now,
                UpdatedDate = now,
                Status = property.IsInstantBook ? BookingStatus.Confirmed : BookingStatus.Pending
            };

            ValidateBookingOnAdd(booking);
            var addedBooking = await this.storageBroker.InsertBookingAsync(booking);
            
            // Emails...
            await SendBookingConfirmationToGuestAsync(addedBooking, property);
            await SendNewBookingAlertToHostAsync(addedBooking, property);
            
            return ToBookingResponse(addedBooking);
        }

        public async ValueTask<(IEnumerable<BookingResponse> Items, int TotalCount)> RetrieveBookingsAsync(BookingQueryParams queryParams)
        {
            var currentUserId = this.currentUserService.GetCurrentUserId();
            if (!currentUserId.HasValue && !this.currentUserService.IsInRole("Admin"))
            {
                throw new UnauthorizedAccessException("Unauthorized.");
            }

            IQueryable<Booking> query = this.storageBroker.SelectAllBookings();

            if (queryParams.IsHostView)
            {
                query = query.Where(b => b.Property.HostId == currentUserId.Value);
            }
            else 
            {
                // General guest bookings (unless admin is retrieving all)
                if (queryParams.UserId.HasValue)
                {
                    query = query.Where(b => b.GuestId == queryParams.UserId.Value);
                }
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((queryParams.Page - 1) * queryParams.PageSize)
                .Take(queryParams.PageSize)
                .ToListAsync();

            var responseItems = items.Select(ToBookingResponse).ToList();
            return (responseItems, totalCount);
        }

        public async ValueTask<BookingResponse> RetrieveBookingByIdAsync(Guid bookingId)
        {
            ValidateBookingId(bookingId);
            Booking booking = await this.storageBroker.SelectBookingByIdAsync(bookingId);
            ValidateStorageBooking(booking, bookingId);
            
            var currentUserId = this.currentUserService.GetCurrentUserId();
            if (!currentUserId.HasValue || (!this.currentUserService.IsInRole("Admin") && 
                booking.GuestId != currentUserId.Value && booking.Property.HostId != currentUserId.Value))
            {
                throw new UnauthorizedAccessException("You can only access your own bookings.");
            }
            
            return ToBookingResponse(booking);
        }

        public async ValueTask<BookingResponse> ConfirmBookingAsync(Guid bookingId)
        {
            ValidateBookingId(bookingId);
            Booking booking = await this.storageBroker.SelectBookingByIdAsync(bookingId);
            ValidateStorageBooking(booking, bookingId);

            var currentUserId = this.currentUserService.GetCurrentUserId();
            if (!currentUserId.HasValue || (!this.currentUserService.IsInRole("Admin") && booking.Property.HostId != currentUserId.Value))
            {
                throw new UnauthorizedAccessException("You can only confirm bookings on your own properties.");
            }

            if (booking.Status != BookingStatus.Pending)
            {
                throw new InvalidOperationException("Only pending bookings can be confirmed.");
            }

            booking.Status = BookingStatus.Confirmed;
            booking.UpdatedDate = DateTimeOffset.UtcNow;

            var updatedBooking = await this.storageBroker.UpdateBookingAsync(booking);
            return ToBookingResponse(updatedBooking);
        }

        public async ValueTask<BookingResponse> CancelBookingAsync(Guid bookingId)
        {
            ValidateBookingId(bookingId);
            Booking booking = await this.storageBroker.SelectBookingByIdAsync(bookingId);
            ValidateStorageBooking(booking, bookingId);

            var currentUserId = this.currentUserService.GetCurrentUserId();
            if (!currentUserId.HasValue || (!this.currentUserService.IsInRole("Admin") && 
                booking.GuestId != currentUserId.Value && booking.Property.HostId != currentUserId.Value))
            {
                throw new UnauthorizedAccessException("You can only cancel your own bookings.");
            }

            booking.Status = BookingStatus.Cancelled;
            booking.UpdatedDate = DateTimeOffset.UtcNow;

            var updatedBooking = await this.storageBroker.UpdateBookingAsync(booking);
            return ToBookingResponse(updatedBooking);
        }

        // --- Backwards compatible internal methods --- //
        public IQueryable<Booking> RetrieveAllBookings() =>
            TryCatch(() => this.storageBroker.SelectAllBookings());

        public ValueTask<Booking> ModifyBookingAsync(Booking booking) =>
            TryCatch(async () =>
            {
                ValidateBookingOnModify(booking);
                Booking maybeBooking = await this.storageBroker.SelectBookingByIdAsync(booking.Id);
                ValidateStorageBooking(maybeBooking, booking.Id);
                return await this.storageBroker.UpdateBookingAsync(booking);
            });

        public ValueTask<Booking> RemoveBookingAsync(Guid bookingId) =>
            TryCatch(async () =>
            {
                ValidateBookingId(bookingId);
                Booking maybeBooking = await this.storageBroker.SelectBookingByIdAsync(bookingId);
                ValidateStorageBooking(maybeBooking, bookingId);
                return await this.storageBroker.DeleteBookingAsync(bookingId);
            });

        // Mapping function internally used
        private static BookingResponse ToBookingResponse(Booking b)
        {
            return new BookingResponse
            {
                Id = b.Id,
                PropertyId = b.PropertyId,
                GuestId = b.GuestId,
                CheckInDate = b.CheckInDate,
                CheckOutDate = b.CheckOutDate,
                GuestsCount = b.GuestsCount,
                TotalPrice = b.TotalPrice,
                Status = b.Status,
                Source = b.Source,
                SpecialRequests = b.SpecialRequests,
                CreatedDate = b.CreatedDate,
                UpdatedDate = b.UpdatedDate
            };
        }
        
        private async Task SendBookingConfirmationToGuestAsync(Booking booking, Models.Foundations.Properties.Property property) { }
        private async Task SendNewBookingAlertToHostAsync(Booking booking, Models.Foundations.Properties.Property property) { }
    }
}
`

const pathController = 'Mulkchi.Api/Controllers/BookingsController.cs'
const contentController = `#nullable disable

using System;
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
    }
}
`

fs.writeFileSync(pathInterface, contentInterface)
fs.writeFileSync(pathService, contentService)
fs.writeFileSync(pathController, contentController)
console.log('Bookings architecture refactored on disk.')
