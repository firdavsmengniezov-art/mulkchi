#nullable disable

namespace Mulkchi.Api.Models.Foundations.Properties;

public class Property
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public PropertyType Type { get; set; }
    public PropertyCategory Category { get; set; }
    public PropertyStatus Status { get; set; }
    public ListingType ListingType { get; set; }
    public decimal? MonthlyRent { get; set; }
    public decimal? SalePrice { get; set; }
    public decimal? PricePerNight { get; set; }
    public decimal? SecurityDeposit { get; set; }
    public double Area { get; set; }
    public int NumberOfBedrooms { get; set; }
    public int NumberOfBathrooms { get; set; }
    public int MaxGuests { get; set; }
    public UzbekistanRegion Region { get; set; }
    public string City { get; set; }
    public string District { get; set; }
    public string Address { get; set; }
    public string Mahalla { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool HasWifi { get; set; }
    public bool HasParking { get; set; }
    public bool HasPool { get; set; }
    public bool PetsAllowed { get; set; }
    public bool IsInstantBook { get; set; }
    public bool IsVacant { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsVerified { get; set; }
    public decimal AverageRating { get; set; }
    public int ViewsCount { get; set; }
    public int FavoritesCount { get; set; }
    public Guid HostId { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public DateTimeOffset UpdatedDate { get; set; }
    public DateTimeOffset? DeletedDate { get; set; }
}
