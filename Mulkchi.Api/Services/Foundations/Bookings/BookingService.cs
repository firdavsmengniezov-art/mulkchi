#nullable disable

using System;
using System.Linq;
using System.Threading.Tasks;
using Mulkchi.Api.Models.Foundations.Bookings;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Services.Foundations.Auth;
using Mulkchi.Api.Brokers.Notifications;
using Microsoft.Extensions.Logging;

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

        public ValueTask<Booking> AddBookingAsync(Booking booking) =>
            TryCatch(async () =>
            {
                ValidateBookingOnAdd(booking);
                
                // Get property details for email
                var property = await this.storageBroker.SelectPropertyByIdAsync(booking.PropertyId);
                
                // Add the booking
                var addedBooking = await this.storageBroker.InsertBookingAsync(booking);
                
                // Send confirmation email to guest
                await SendBookingConfirmationToGuestAsync(addedBooking, property);
                
                // Send notification email to host
                await SendNewBookingAlertToHostAsync(addedBooking, property);
                
                return addedBooking;
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

        private async Task SendBookingConfirmationToGuestAsync(Booking booking, Models.Foundations.Properties.Property property)
        {
            try
            {
                // Get guest email (would need to be implemented based on User model)
                string guestEmail = "guest@example.com"; // Placeholder - would get from User service
                
                string subject = "Booking Confirmation - Mulkchi";
                string body = $@"
                    <h2>Booking Confirmation</h2>
                    <p>Dear Guest,</p>
                    <p>Your booking has been confirmed!</p>
                    <h3>Property Details:</h3>
                    <p><strong>Title:</strong> {property.Title}</p>
                    <p><strong>Address:</strong> {property.Address}, {property.City}</p>
                    <p><strong>Check-in:</strong> {booking.CheckInDate:yyyy-MM-dd}</p>
                    <p><strong>Check-out:</strong> {booking.CheckOutDate:yyyy-MM-dd}</p>
                    <p><strong>Total Price:</strong> {booking.TotalPrice:C}</p>
                    <p>Thank you for choosing Mulkchi!</p>
                ";

                await this.emailBroker.SendEmailAsync(guestEmail, subject, body);
            }
            catch (Exception ex)
            {
                // Log error but don't fail booking process
                this.logger.LogWarning(ex, "Failed to send booking confirmation email for booking {BookingId}", booking.Id);
            }
        }

        private async Task SendNewBookingAlertToHostAsync(Booking booking, Models.Foundations.Properties.Property property)
        {
            try
            {
                // Get host email (would need to be implemented based on User model)
                string hostEmail = "host@example.com"; // Placeholder - would get from User service
                
                string subject = "New Booking Alert - Mulkchi";
                string body = $@"
                    <h2>New Booking Received</h2>
                    <p>Dear Host,</p>
                    <p>You have received a new booking for your property!</p>
                    <h3>Property Details:</h3>
                    <p><strong>Title:</strong> {property.Title}</p>
                    <p><strong>Address:</strong> {property.Address}, {property.City}</p>
                    <h3>Booking Details:</h3>
                    <p><strong>Check-in:</strong> {booking.CheckInDate:yyyy-MM-dd}</p>
                    <p><strong>Check-out:</strong> {booking.CheckOutDate:yyyy-MM-dd}</p>
                    <p><strong>Total Price:</strong> {booking.TotalPrice:C}</p>
                    <p><strong>Guest ID:</strong> {booking.GuestId}</p>
                    <p>Please review the booking details and prepare for the guest's arrival.</p>
                ";

                await this.emailBroker.SendEmailAsync(hostEmail, subject, body);
            }
            catch (Exception ex)
            {
                // Log error but don't fail the booking process
                this.logger.LogWarning(ex, "Failed to send new booking alert email for booking {BookingId}", booking.Id);
            }
        }
    }
}