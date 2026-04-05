const fs = require('fs')

const iServicePath =
	'Mulkchi.Api/Services/Foundations/Properties/IPropertyService.cs'
const iServiceContent = `using Mulkchi.Api.Models.Foundations.Properties;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Mulkchi.Api.Services.Foundations.Properties;

public interface IPropertyService
{
    ValueTask<PropertyResponse> AddPropertyAsync(PropertyCreateDto dto);
    ValueTask<(IEnumerable<PropertyResponse> Items, int TotalCount)> RetrieveAllPropertiesAsync(PropertyQueryParams queryParams);
    
    // Existing base methods format preserved where necessary
    IQueryable<Property> RetrieveAllProperties();
    ValueTask<Property> RetrievePropertyByIdAsync(Guid propertyId);
    ValueTask<Property> ModifyPropertyAsync(Property property);
    ValueTask<Property> RemovePropertyByIdAsync(Guid propertyId);
}`

const servicePath =
	'Mulkchi.Api/Services/Foundations/Properties/PropertyService.cs'
const serviceContent = `using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.Properties.Exceptions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Services.Foundations.Auth;
using Microsoft.Extensions.Localization;
using Mulkchi.Api.Resources;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Mulkchi.Api.Services.Foundations.Properties;

public partial class PropertyService : IPropertyService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;
    private readonly ICurrentUserService currentUserService;
    private readonly IStringLocalizer<SharedResource> localizer;

    public PropertyService(
        IStorageBroker storageBroker,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker,
        ICurrentUserService currentUserService,
        IStringLocalizer<SharedResource> localizer)
    {
        this.storageBroker = storageBroker;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
        this.currentUserService = currentUserService;
        this.localizer = localizer;
    }

    public async ValueTask<PropertyResponse> AddPropertyAsync(PropertyCreateDto dto)
    {
        var currentUserId = this.currentUserService.GetCurrentUserId();
        if (!currentUserId.HasValue)
        {
            throw new UnauthorizedAccessException("Current user is missing.");
        }

        var now = this.dateTimeBroker.GetCurrentDateTimeOffset();

        var property = new Property
        {
            Id = Guid.NewGuid(),
            HostId = currentUserId.Value,
            Title = dto.Title,
            Description = dto.Description,
            Type = dto.Type,
            Category = dto.Category,
            Status = dto.Status,
            ListingType = dto.ListingType,
            MonthlyRent = dto.MonthlyRent,
            SalePrice = dto.SalePrice,
            PricePerNight = dto.PricePerNight,
            SecurityDeposit = dto.SecurityDeposit,
            Area = dto.Area,
            NumberOfBedrooms = dto.NumberOfBedrooms,
            NumberOfBathrooms = dto.NumberOfBathrooms,
            MaxGuests = dto.MaxGuests,
            Region = dto.Region,
            City = dto.City,
            District = dto.District,
            Address = dto.Address,
            Mahalla = dto.Mahalla,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            HasWifi = dto.HasWifi,
            HasParking = dto.HasParking,
            HasPool = dto.HasPool,
            PetsAllowed = dto.PetsAllowed,
            IsInstantBook = dto.IsInstantBook,
            IsVacant = dto.IsVacant,
            HasMetroNearby = dto.HasMetroNearby,
            HasBusStop = dto.HasBusStop,
            HasMarketNearby = dto.HasMarketNearby,
            HasSchoolNearby = dto.HasSchoolNearby,
            HasHospitalNearby = dto.HasHospitalNearby,
            DistanceToCityCenter = dto.DistanceToCityCenter,
            HasElevator = dto.HasElevator,
            HasSecurity = dto.HasSecurity,
            HasGenerator = dto.HasGenerator,
            HasGas = dto.HasGas,
            HasFurniture = dto.HasFurniture,
            IsRenovated = dto.IsRenovated,
            HasAirConditioning = dto.HasAirConditioning,
            HasHeating = dto.HasHeating,
            HasWasher = dto.HasWasher,
            HasKitchen = dto.HasKitchen,
            HasTV = dto.HasTV,
            HasWorkspace = dto.HasWorkspace,
            IsSelfCheckIn = dto.IsSelfCheckIn,
            IsChildFriendly = dto.IsChildFriendly,
            IsAccessible = dto.IsAccessible,
            Currency = dto.Currency,
            ExchangeRate = dto.ExchangeRate,
            
            // Set defaults enforced by business rules
            IsFeatured = false,
            IsVerified = false,
            AverageRating = 0,
            ViewsCount = 0,
            FavoritesCount = 0,
            CreatedDate = now,
            UpdatedDate = now
        };

        ValidatePropertyOnAdd(property);
        Property addedProperty = await this.storageBroker.InsertPropertyAsync(property);

        return ToPropertyResponse(addedProperty);
    }

    public async ValueTask<(IEnumerable<PropertyResponse> Items, int TotalCount)> RetrieveAllPropertiesAsync(PropertyQueryParams queryParams)
    {
        IQueryable<Property> query = this.storageBroker.SelectAllProperties();

        if (!string.IsNullOrWhiteSpace(queryParams.City))
            query = query.Where(p => p.City == queryParams.City);

        if (queryParams.MinPrice.HasValue)
            query = query.Where(p => p.MonthlyRent >= queryParams.MinPrice || p.SalePrice >= queryParams.MinPrice || p.PricePerNight >= queryParams.MinPrice);

        if (queryParams.MaxPrice.HasValue)
            query = query.Where(p => p.MonthlyRent <= queryParams.MaxPrice || p.SalePrice <= queryParams.MaxPrice || p.PricePerNight <= queryParams.MaxPrice);

        if (queryParams.Bedrooms.HasValue)
            query = query.Where(p => p.NumberOfBedrooms == queryParams.Bedrooms);

        if (queryParams.Region.HasValue)
            query = query.Where(p => p.Region == queryParams.Region.Value);

        if (queryParams.ListingType.HasValue)
            query = query.Where(p => p.ListingType == queryParams.ListingType.Value);
            
        if (queryParams.PropertyType.HasValue)
            query = query.Where(p => p.Type == queryParams.PropertyType.Value);

        int totalCount = await query.CountAsync();

        var properties = await query
            .Skip((queryParams.Page - 1) * queryParams.PageSize)
            .Take(queryParams.PageSize)
            .ToListAsync();

        var responseItems = properties.Select(ToPropertyResponse).ToList();

        return (responseItems, totalCount);
    }
    
    // Kept for backward compatibility handling
    public IQueryable<Property> RetrieveAllProperties() =>
        TryCatch(() => this.storageBroker.SelectAllProperties());

    public ValueTask<Property> RetrievePropertyByIdAsync(Guid propertyId) =>
        TryCatch(async () =>
        {
            ValidatePropertyId(propertyId);
            Property maybeProperty = await this.storageBroker.SelectPropertyByIdAsync(propertyId);

            if (maybeProperty is null)
                throw new NotFoundPropertyException(propertyId);

            return maybeProperty;
        });

    public ValueTask<Property> ModifyPropertyAsync(Property property) =>
        TryCatch(async () =>
        {
            ValidatePropertyOnModify(property);
            var currentUserId = this.currentUserService.GetCurrentUserId();
            if (!currentUserId.HasValue || (!this.currentUserService.IsInRole("Admin") && property.HostId != currentUserId.Value))
            {
                throw new UnauthorizedAccessException("You can only modify your own properties.");
            }
            property.UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset();
            return await this.storageBroker.UpdatePropertyAsync(property);
        });

    public ValueTask<Property> RemovePropertyByIdAsync(Guid propertyId) =>
        TryCatch(async () =>
        {
            ValidatePropertyId(propertyId);
            Property existingProperty = await this.storageBroker.SelectPropertyByIdAsync(propertyId);
            if (existingProperty is null)
                throw new NotFoundPropertyException(propertyId);
            
            var currentUserId = this.currentUserService.GetCurrentUserId();
            if (!currentUserId.HasValue || (!this.currentUserService.IsInRole("Admin") && existingProperty.HostId != currentUserId.Value))
            {
                throw new UnauthorizedAccessException("You can only delete your own properties.");
            }
            return await this.storageBroker.DeletePropertyByIdAsync(propertyId);
        });

    private static PropertyResponse ToPropertyResponse(Property p)
    {
        return new PropertyResponse
        {
            Id = p.Id,
            Title = p.Title,
            Description = p.Description,
            Type = p.Type,
            Category = p.Category,
            Status = p.Status,
            ListingType = p.ListingType,
            MonthlyRent = p.MonthlyRent,
            SalePrice = p.SalePrice,
            PricePerNight = p.PricePerNight,
            SecurityDeposit = p.SecurityDeposit,
            Area = p.Area,
            NumberOfBedrooms = p.NumberOfBedrooms,
            NumberOfBathrooms = p.NumberOfBathrooms,
            MaxGuests = p.MaxGuests,
            Region = p.Region,
            City = p.City,
            District = p.District,
            Address = p.Address,
            Mahalla = p.Mahalla,
            Latitude = p.Latitude,
            Longitude = p.Longitude,
            HasWifi = p.HasWifi,
            HasParking = p.HasParking,
            HasPool = p.HasPool,
            PetsAllowed = p.PetsAllowed,
            IsInstantBook = p.IsInstantBook,
            IsVacant = p.IsVacant,
            IsFeatured = p.IsFeatured,
            IsVerified = p.IsVerified,
            HasMetroNearby = p.HasMetroNearby,
            HasBusStop = p.HasBusStop,
            HasMarketNearby = p.HasMarketNearby,
            HasSchoolNearby = p.HasSchoolNearby,
            HasHospitalNearby = p.HasHospitalNearby,
            DistanceToCityCenter = p.DistanceToCityCenter,
            HasElevator = p.HasElevator,
            HasSecurity = p.HasSecurity,
            HasGenerator = p.HasGenerator,
            HasGas = p.HasGas,
            HasFurniture = p.HasFurniture,
            IsRenovated = p.IsRenovated,
            HasAirConditioning = p.HasAirConditioning,
            HasHeating = p.HasHeating,
            HasWasher = p.HasWasher,
            HasKitchen = p.HasKitchen,
            HasTV = p.HasTV,
            HasWorkspace = p.HasWorkspace,
            IsSelfCheckIn = p.IsSelfCheckIn,
            IsChildFriendly = p.IsChildFriendly,
            IsAccessible = p.IsAccessible,
            AverageRating = p.AverageRating,
            ViewsCount = p.ViewsCount,
            FavoritesCount = p.FavoritesCount,
            HostId = p.HostId,
            Currency = p.Currency,
            ExchangeRate = p.ExchangeRate,
            CreatedDate = p.CreatedDate,
            UpdatedDate = p.UpdatedDate,
            DeletedDate = p.DeletedDate,
            MonthlyRentUSD = p.MonthlyRent.HasValue ? p.MonthlyRent.Value / p.ExchangeRate : null,
            SalePriceUSD = p.SalePrice.HasValue ? p.SalePrice.Value / p.ExchangeRate : null,
            PricePerNightUSD = p.PricePerNight.HasValue ? p.PricePerNight.Value / p.ExchangeRate : null,
            SecurityDepositUSD = p.SecurityDeposit.HasValue ? p.SecurityDeposit.Value / p.ExchangeRate : null
        };
    }
}`

const controllerPath = 'Mulkchi.Api/Controllers/PropertiesController.cs'
const controllerContent = `using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mulkchi.Api.Models.Foundations.Common;
using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.Properties.Exceptions;
using Mulkchi.Api.Services.Foundations.Properties;
using System.Threading.Tasks;
using System;

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
    public async Task<ActionResult<PropertyResponse>> PostPropertyAsync([FromBody] PropertyCreateDto dto)
    {
        try
        {
            var addedProperty = await this.propertyService.AddPropertyAsync(dto);
            return Created($"api/properties/{addedProperty.Id}", addedProperty);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
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
            return StatusCode(500, new { message = "Internal server error." });
        }
        catch (PropertyServiceException)
        {
            return StatusCode(500, new { message = "Internal server error." });
        }
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<PropertyResponse>>> GetAllProperties([FromQuery] PropertyQueryParams queryParams)
    {
        try
        {
            var (items, total) = await this.propertyService.RetrieveAllPropertiesAsync(queryParams);

            var result = new PagedResult<PropertyResponse>
            {
                Items = items,
                TotalCount = total,
                Page = queryParams.Page,
                PageSize = queryParams.PageSize
            };

            return Ok(result);
        }
        catch (PropertyDependencyException)
        {
            return StatusCode(500, new { message = "Internal server error." });
        }
        catch (PropertyServiceException)
        {
            return StatusCode(500, new { message = "Internal server error." });
        }
    }
}
`

fs.writeFileSync(iServicePath, iServiceContent, 'utf-8')
fs.writeFileSync(servicePath, serviceContent, 'utf-8')
fs.writeFileSync(controllerPath, controllerContent, 'utf-8')

console.log('Files successfully written to disk.')
