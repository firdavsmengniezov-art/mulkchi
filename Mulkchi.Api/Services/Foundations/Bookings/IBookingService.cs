#nullable disable

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mulkchi.Api.Models.Foundations.Bookings;

namespace Mulkchi.Api.Services.Foundations.Bookings
{
    public interface IBookingService
    {
        ValueTask<Booking> AddBookingAsync(Booking booking);
        IQueryable<Booking> RetrieveAllBookings();
        ValueTask<Booking> RetrieveBookingByIdAsync(Guid bookingId);
        ValueTask<Booking> ModifyBookingAsync(Booking booking);
        ValueTask<Booking> RemoveBookingAsync(Guid bookingId);
    }
}