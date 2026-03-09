#nullable disable

using System;
using System.Linq;
using System.Threading.Tasks;
using Mulkchi.Api.Models.Foundations.Bookings;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Services.Foundations.Auth;

namespace Mulkchi.Api.Services.Foundations.Bookings
{
    public partial class BookingService : IBookingService
    {
        private readonly IStorageBroker storageBroker;
        private readonly ICurrentUserService currentUserService;

        public BookingService(IStorageBroker storageBroker, ICurrentUserService currentUserService)
        {
            this.storageBroker = storageBroker;
            this.currentUserService = currentUserService;
        }

        public ValueTask<Booking> AddBookingAsync(Booking booking) =>
            TryCatch(async () =>
            {
                ValidateBookingOnAdd(booking);
                return await this.storageBroker.InsertBookingAsync(booking);
            });

        public IQueryable<Booking> RetrieveAllBookings() =>
            TryCatch(() => this.storageBroker.SelectAllBookings());

        public ValueTask<Booking> RetrieveBookingByIdAsync(Guid bookingId) =>
            TryCatch(async () =>
            {
                ValidateBookingId(bookingId);
                Booking maybeBooking = await this.storageBroker.SelectBookingByIdAsync(bookingId);
                ValidateStorageBooking(maybeBooking, bookingId);
                
                // Check authorization: only guest or property host can access
                var currentUserId = this.currentUserService.GetCurrentUserId();
                if (!currentUserId.HasValue || (!this.currentUserService.IsInRole("Admin") && 
                    maybeBooking.GuestId != currentUserId.Value && maybeBooking.Property.HostId != currentUserId.Value))
                {
                    throw new UnauthorizedAccessException("You can only access your own bookings or bookings for your properties.");
                }
                
                return maybeBooking;
            });

        public ValueTask<Booking> ModifyBookingAsync(Booking booking) =>
            TryCatch(async () =>
            {
                ValidateBookingOnModify(booking);
                Booking maybeBooking = await this.storageBroker.SelectBookingByIdAsync(booking.Id);
                ValidateStorageBooking(maybeBooking, booking.Id);
                
                // Check authorization: only guest or property host can modify
                var currentUserId = this.currentUserService.GetCurrentUserId();
                if (!currentUserId.HasValue || (!this.currentUserService.IsInRole("Admin") && 
                    maybeBooking.GuestId != currentUserId.Value && maybeBooking.Property.HostId != currentUserId.Value))
                {
                    throw new UnauthorizedAccessException("You can only modify your own bookings or bookings for your properties.");
                }
                
                return await this.storageBroker.UpdateBookingAsync(booking);
            });

        public ValueTask<Booking> RemoveBookingAsync(Guid bookingId) =>
            TryCatch(async () =>
            {
                ValidateBookingId(bookingId);
                Booking maybeBooking = await this.storageBroker.SelectBookingByIdAsync(bookingId);
                ValidateStorageBooking(maybeBooking, bookingId);
                
                // Check authorization: only guest or property host can delete
                var currentUserId = this.currentUserService.GetCurrentUserId();
                if (!currentUserId.HasValue || (!this.currentUserService.IsInRole("Admin") && 
                    maybeBooking.GuestId != currentUserId.Value && maybeBooking.Property.HostId != currentUserId.Value))
                {
                    throw new UnauthorizedAccessException("You can only delete your own bookings or bookings for your properties.");
                }
                
                return await this.storageBroker.DeleteBookingAsync(bookingId);
            });
    }
}