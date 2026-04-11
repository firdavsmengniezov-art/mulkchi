using System;
using System.Linq;
using Mulkchi.Api.Models.Foundations.Properties;

namespace Mulkchi.Api.Models.Foundations.Properties.Extensions;

public static class PropertyGeoExtensions
{
    private const double EarthRadiusKm = 6371.0;

    public static IQueryable<Property> WithinRadius(
        this IQueryable<Property> properties,
        double latitude,
        double longitude,
        double radiusInKm)
    {
        var latRad = latitude * Math.PI / 180.0;
        var lonRad = longitude * Math.PI / 180.0;

        return properties.Where(p =>
            p.Latitude.HasValue && p.Longitude.HasValue &&
            (2.0 * EarthRadiusKm * Math.Asin(Math.Sqrt(
                Math.Pow(Math.Sin((p.Latitude!.Value * Math.PI / 180.0 - latRad) / 2.0), 2.0) +
                Math.Cos(latRad) * Math.Cos(p.Latitude!.Value * Math.PI / 180.0) *
                Math.Pow(Math.Sin((p.Longitude!.Value * Math.PI / 180.0 - lonRad) / 2.0), 2.0)
            ))) <= radiusInKm);
    }

    public static IQueryable<Property> OrderByDistance(
        this IQueryable<Property> properties,
        double latitude,
        double longitude)
    {
        var latRad = latitude * Math.PI / 180.0;
        var lonRad = longitude * Math.PI / 180.0;

        return properties
            .Where(p => p.Latitude.HasValue && p.Longitude.HasValue)
            .OrderBy(p =>
                2.0 * EarthRadiusKm * Math.Asin(Math.Sqrt(
                    Math.Pow(Math.Sin((p.Latitude!.Value * Math.PI / 180.0 - latRad) / 2.0), 2.0) +
                    Math.Cos(latRad) * Math.Cos(p.Latitude!.Value * Math.PI / 180.0) *
                    Math.Pow(Math.Sin((p.Longitude!.Value * Math.PI / 180.0 - lonRad) / 2.0), 2.0)
                )));
    }
}