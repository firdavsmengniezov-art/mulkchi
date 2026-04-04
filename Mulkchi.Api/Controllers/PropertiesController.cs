using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Common;
using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.Properties.Exceptions;
using Mulkchi.Api.Services.Foundations.Properties;
using System.Linq;

namespace Mulkchi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PropertiesController : ControllerBase
{
    private readonly IPropertyService propertyService;

    public PropertiesController(IPropertyService propertyService)
    {
        this.propertyService = propertyService;
    }

    [HttpPost]
    [Authorize(Roles = "Host,Admin")]
    public async ValueTask<ActionResult<Property>> PostPropertyAsync(Property property)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                return Unauthorized();

            property.HostId = currentUserId;
            property.IsFeatured = false;
            property.IsVerified = false;
            property.AverageRating = 0;
            property.ViewsCount = 0;
            property.FavoritesCount = 0;

            Property addedProperty = await this.propertyService.AddPropertyAsync(property);
            return Created("property", addedProperty);
        }
        catch (PropertyValidationException propertyValidationException)
        {
            return BadRequest(new { message = propertyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyDependencyValidationException propertyDependencyValidationException)
        {
            return BadRequest(new { message = propertyDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (PropertyServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpGet]
    [AllowAnonymous]
    public ActionResult<PagedResult<PropertyResponse>> GetAllProperties(
        [FromQuery] PaginationParams pagination,
        [FromQuery] string? city = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] int? bedrooms = null,
        [FromQuery] UzbekistanRegion? region = null,
        [FromQuery] ListingType? listingType = null,
        [FromQuery] Currency? currency = null)
    {
        try
        {
            IQueryable<Property> query = this.propertyService.RetrieveAllProperties();

            if (!string.IsNullOrWhiteSpace(city))
                query = query.Where(p => p.City == city);

            if (minPrice.HasValue)
                query = query.Where(p => p.MonthlyRent >= minPrice || p.SalePrice >= minPrice || p.PricePerNight >= minPrice);

            if (maxPrice.HasValue)
                query = query.Where(p => p.MonthlyRent <= maxPrice || p.SalePrice <= maxPrice || p.PricePerNight <= maxPrice);

            if (bedrooms.HasValue)
                query = query.Where(p => p.NumberOfBedrooms == bedrooms);

            if (region.HasValue)
                query = query.Where(p => p.Region == region.Value);

            if (listingType.HasValue)
                query = query.Where(p => p.ListingType == listingType.Value);

            int totalCount = query.Count();

            var items = query
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToList();

            // Convert to PropertyResponse with currency conversion
            var responseItems = items.Select(property => new PropertyResponse
            {
                // Original properties
                Id = property.Id,
                Title = property.Title,
                Description = property.Description,
                Type = property.Type,
                Category = property.Category,
                Status = property.Status,
                ListingType = property.ListingType,
                MonthlyRent = property.MonthlyRent,
                SalePrice = property.SalePrice,
                PricePerNight = property.PricePerNight,
                SecurityDeposit = property.SecurityDeposit,
                Area = property.Area,
                NumberOfBedrooms = property.NumberOfBedrooms,
                NumberOfBathrooms = property.NumberOfBathrooms,
                MaxGuests = property.MaxGuests,
                Region = property.Region,
                City = property.City,
                District = property.District,
                Address = property.Address,
                Mahalla = property.Mahalla,
                Latitude = property.Latitude,
                Longitude = property.Longitude,
                HasWifi = property.HasWifi,
                HasParking = property.HasParking,
                HasPool = property.HasPool,
                PetsAllowed = property.PetsAllowed,
                IsInstantBook = property.IsInstantBook,
                IsVacant = property.IsVacant,
                IsFeatured = property.IsFeatured,
                IsVerified = property.IsVerified,
                HasMetroNearby = property.HasMetroNearby,
                HasBusStop = property.HasBusStop,
                HasMarketNearby = property.HasMarketNearby,
                HasSchoolNearby = property.HasSchoolNearby,
                HasHospitalNearby = property.HasHospitalNearby,
                DistanceToCityCenter = property.DistanceToCityCenter,
                HasElevator = property.HasElevator,
                HasSecurity = property.HasSecurity,
                HasGenerator = property.HasGenerator,
                HasGas = property.HasGas,
                HasFurniture = property.HasFurniture,
                IsRenovated = property.IsRenovated,
                HasAirConditioning = property.HasAirConditioning,
                HasHeating = property.HasHeating,
                HasWasher = property.HasWasher,
                HasKitchen = property.HasKitchen,
                HasTV = property.HasTV,
                HasWorkspace = property.HasWorkspace,
                IsSelfCheckIn = property.IsSelfCheckIn,
                IsChildFriendly = property.IsChildFriendly,
                IsAccessible = property.IsAccessible,
                AverageRating = property.AverageRating,
                ViewsCount = property.ViewsCount,
                FavoritesCount = property.FavoritesCount,
                HostId = property.HostId,
                Currency = property.Currency,
                ExchangeRate = property.ExchangeRate,
                CreatedDate = property.CreatedDate,
                UpdatedDate = property.UpdatedDate,
                DeletedDate = property.DeletedDate,

                // USD converted prices
                MonthlyRentUSD = property.MonthlyRent.HasValue ? property.MonthlyRent.Value / property.ExchangeRate : null,
                SalePriceUSD = property.SalePrice.HasValue ? property.SalePrice.Value / property.ExchangeRate : null,
                PricePerNightUSD = property.PricePerNight.HasValue ? property.PricePerNight.Value / property.ExchangeRate : null,
                SecurityDepositUSD = property.SecurityDeposit.HasValue ? property.SecurityDeposit.Value / property.ExchangeRate : null
            }).ToList();

            var result = new PagedResult<PropertyResponse>
            {
                Items = responseItems,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };

            return Ok(result);
        }
        catch (PropertyDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (PropertyServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public ActionResult<PagedResult<PropertyResponse>> SearchProperties(
        [FromQuery] PropertySearchParams searchParams,
        [FromQuery] PaginationParams pagination)
    {
        try
        {
            IQueryable<Property> query = this.propertyService.RetrieveAllProperties();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(searchParams.Region))
                query = query.Where(p => p.City.Contains(searchParams.Region) || p.Region.ToString().Contains(searchParams.Region));

            if (!string.IsNullOrWhiteSpace(searchParams.City))
                query = query.Where(p => p.City.Contains(searchParams.City));

            if (searchParams.MinPrice.HasValue)
                query = query.Where(p => p.MonthlyRent >= searchParams.MinPrice || p.SalePrice >= searchParams.MinPrice || p.PricePerNight >= searchParams.MinPrice);

            if (searchParams.MaxPrice.HasValue)
                query = query.Where(p => p.MonthlyRent <= searchParams.MaxPrice || p.SalePrice <= searchParams.MaxPrice || p.PricePerNight <= searchParams.MaxPrice);

            if (searchParams.Bedrooms.HasValue)
                query = query.Where(p => p.NumberOfBedrooms == searchParams.Bedrooms);

            if (searchParams.PropertyType.HasValue)
                query = query.Where(p => p.Type == searchParams.PropertyType);

            if (searchParams.HasWifi.HasValue)
                query = query.Where(p => p.HasWifi == searchParams.HasWifi);

            if (searchParams.HasParking.HasValue)
                query = query.Where(p => p.HasParking == searchParams.HasParking);

            if (searchParams.HasPool.HasValue)
                query = query.Where(p => p.HasPool == searchParams.HasPool);

            if (searchParams.IsVerified.HasValue)
                query = query.Where(p => p.IsVerified == searchParams.IsVerified);

            // Apply sorting
            query = searchParams.SortBy?.ToLower() switch
            {
                "price_asc" => query.OrderBy(p => p.MonthlyRent ?? p.SalePrice ?? p.PricePerNight ?? 0),
                "price_desc" => query.OrderByDescending(p => p.MonthlyRent ?? p.SalePrice ?? p.PricePerNight ?? 0),
                "newest" => query.OrderByDescending(p => p.CreatedDate),
                "rating" => query.OrderByDescending(p => p.AverageRating),
                _ => query.OrderByDescending(p => p.CreatedDate)
            };

            int totalCount = query.Count();

            var items = query
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToList();

            // Convert to PropertyResponse with currency conversion
            var responseItems = items.Select(property => new PropertyResponse
            {
                // Original properties
                Id = property.Id,
                Title = property.Title,
                Description = property.Description,
                Type = property.Type,
                Category = property.Category,
                Status = property.Status,
                ListingType = property.ListingType,
                MonthlyRent = property.MonthlyRent,
                SalePrice = property.SalePrice,
                PricePerNight = property.PricePerNight,
                SecurityDeposit = property.SecurityDeposit,
                Area = property.Area,
                NumberOfBedrooms = property.NumberOfBedrooms,
                NumberOfBathrooms = property.NumberOfBathrooms,
                MaxGuests = property.MaxGuests,
                Region = property.Region,
                City = property.City,
                District = property.District,
                Address = property.Address,
                Mahalla = property.Mahalla,
                Latitude = property.Latitude,
                Longitude = property.Longitude,
                HasWifi = property.HasWifi,
                HasParking = property.HasParking,
                HasPool = property.HasPool,
                PetsAllowed = property.PetsAllowed,
                IsInstantBook = property.IsInstantBook,
                IsVacant = property.IsVacant,
                IsFeatured = property.IsFeatured,
                IsVerified = property.IsVerified,
                HasMetroNearby = property.HasMetroNearby,
                HasBusStop = property.HasBusStop,
                HasMarketNearby = property.HasMarketNearby,
                HasSchoolNearby = property.HasSchoolNearby,
                HasHospitalNearby = property.HasHospitalNearby,
                DistanceToCityCenter = property.DistanceToCityCenter,
                HasElevator = property.HasElevator,
                HasSecurity = property.HasSecurity,
                HasGenerator = property.HasGenerator,
                HasGas = property.HasGas,
                HasFurniture = property.HasFurniture,
                IsRenovated = property.IsRenovated,
                HasAirConditioning = property.HasAirConditioning,
                HasHeating = property.HasHeating,
                HasWasher = property.HasWasher,
                HasKitchen = property.HasKitchen,
                HasTV = property.HasTV,
                HasWorkspace = property.HasWorkspace,
                IsSelfCheckIn = property.IsSelfCheckIn,
                IsChildFriendly = property.IsChildFriendly,
                IsAccessible = property.IsAccessible,
                AverageRating = property.AverageRating,
                ViewsCount = property.ViewsCount,
                FavoritesCount = property.FavoritesCount,
                HostId = property.HostId,
                Currency = property.Currency,
                ExchangeRate = property.ExchangeRate,
                CreatedDate = property.CreatedDate,
                UpdatedDate = property.UpdatedDate,
                DeletedDate = property.DeletedDate,

                // USD converted prices
                MonthlyRentUSD = property.MonthlyRent.HasValue ? property.MonthlyRent.Value / property.ExchangeRate : null,
                SalePriceUSD = property.SalePrice.HasValue ? property.SalePrice.Value / property.ExchangeRate : null,
                PricePerNightUSD = property.PricePerNight.HasValue ? property.PricePerNight.Value / property.ExchangeRate : null,
                SecurityDepositUSD = property.SecurityDeposit.HasValue ? property.SecurityDeposit.Value / property.ExchangeRate : null
            }).ToList();

            var result = new PagedResult<PropertyResponse>
            {
                Items = responseItems,
                TotalCount = totalCount,
                Page = pagination.Page,
                PageSize = pagination.PageSize
            };

            return Ok(result);
        }
        catch (PropertyDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (PropertyServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async ValueTask<ActionResult<Property>> GetPropertyByIdAsync(Guid id)
    {
        try
        {
            Property property = await this.propertyService.RetrievePropertyByIdAsync(id);
            return Ok(property);
        }
        catch (PropertyValidationException propertyValidationException)
        {
            return BadRequest(new { message = propertyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyDependencyValidationException propertyDependencyValidationException)
            when (propertyDependencyValidationException.InnerException is NotFoundPropertyException)
        {
            return NotFound(new { message = propertyDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyDependencyValidationException propertyDependencyValidationException)
        {
            return BadRequest(new { message = propertyDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (PropertyServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpPut]
    [Authorize(Roles = "Host,Admin")]
    public async ValueTask<ActionResult<Property>> PutPropertyAsync(Property property)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out Guid currentUserId))
                return Unauthorized();

            bool isAdmin = User.IsInRole("Admin");
            if (!isAdmin)
            {
                Property existingProperty = await this.propertyService.RetrievePropertyByIdAsync(property.Id);
                if (existingProperty.HostId != currentUserId)
                    return Forbid();
            }

            Property modifiedProperty = await this.propertyService.ModifyPropertyAsync(property);
            return Ok(modifiedProperty);
        }
        catch (PropertyValidationException propertyValidationException)
        {
            return BadRequest(new { message = propertyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyDependencyValidationException propertyDependencyValidationException)
            when (propertyDependencyValidationException.InnerException is NotFoundPropertyException)
        {
            return NotFound(new { message = propertyDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyDependencyValidationException propertyDependencyValidationException)
        {
            return BadRequest(new { message = propertyDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (PropertyServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Host,Admin")]
    public async ValueTask<ActionResult<Property>> DeletePropertyByIdAsync(Guid id)
    {
        try
        {
            Property deletedProperty = await this.propertyService.RemovePropertyByIdAsync(id);
            return Ok(deletedProperty);
        }
        catch (PropertyValidationException propertyValidationException)
        {
            return BadRequest(new { message = propertyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyDependencyValidationException propertyDependencyValidationException)
            when (propertyDependencyValidationException.InnerException is NotFoundPropertyException)
        {
            return NotFound(new { message = propertyDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyDependencyValidationException propertyDependencyValidationException)
        {
            return BadRequest(new { message = propertyDependencyValidationException.InnerException?.Message ?? "An error occurred." });
        }
        catch (PropertyDependencyException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
        catch (PropertyServiceException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error." });
        }
    }
}
