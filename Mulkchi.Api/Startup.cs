using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Brokers.Notifications;
using Microsoft.AspNetCore.SignalR;
using Mulkchi.Api.Hubs;
using Mulkchi.Api.Services.Foundations.Users;
using Mulkchi.Api.Services.Foundations.Properties;
using Mulkchi.Api.Services.Foundations.HomeRequests;
using Mulkchi.Api.Services.Foundations.Payments;
using Mulkchi.Api.Services.Foundations.Reviews;
using Mulkchi.Api.Services.Foundations.Messages;
using Mulkchi.Api.Services.Foundations.Notifications;
using Mulkchi.Api.Services.Foundations.RentalContracts;
using Mulkchi.Api.Services.Foundations.Favorites;
using Mulkchi.Api.Services.Foundations.SavedSearches;
using Mulkchi.Api.Services.Foundations.PropertyImages;
using Mulkchi.Api.Services.Foundations.PropertyViews;
using Mulkchi.Api.Services.Foundations.AiRecommendations;
using Mulkchi.Api.Services.Foundations.Discounts;
using Mulkchi.Api.Services.Foundations.DiscountUsages;
using Mulkchi.Api.Services.Foundations.Announcements;
using Mulkchi.Api.Services.Foundations.Auth;
using Mulkchi.Api.Services.Foundations.Bookings;
using Mulkchi.Api.Middleware;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

namespace Mulkchi.Api;

public class Startup
{
    private readonly IConfiguration configuration;

    public Startup(IConfiguration configuration)
    {
        this.configuration = configuration;
    }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler =
                    System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                options.JsonSerializerOptions.DefaultIgnoreCondition =
                    System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
            });
        services.AddEndpointsApiExplorer();
        services.AddHttpContextAccessor(); // Add HttpContextAccessor
        AddSwagger(services);
        AddJwtAuthentication(services);
        AddDbContext(services);
        AddBrokers(services);
        AddFoundationServices(services);
        services.AddSignalR();
        services.AddSingleton<IUserIdProvider, JwtUserIdProvider>();
        AddCors(services);
        
        // Add localization
        services.AddLocalization(options => options.ResourcesPath = "Resources");
        
        // Add health checks
        services.AddHealthChecks()
            .AddDbContextCheck<StorageBroker>(name: "database")
            .AddCheck("file-storage", () => HealthCheckResult.Healthy());
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles(); // Enable static file serving
        app.UseCors("AllowAngular");
        
        // Add global exception handling middleware
        app.UseMiddleware<GlobalExceptionMiddleware>();
        
        // Add rate limiting middleware
        app.UseMiddleware<RateLimitMiddleware>();
        
        // Add request localization
        var supportedCultures = new[] { "uz", "ru", "en" };
        app.UseRequestLocalization(new RequestLocalizationOptions
        {
            DefaultRequestCulture = new Microsoft.AspNetCore.Localization.RequestCulture("uz"),
            SupportedCultures = supportedCultures.Select(c => new System.Globalization.CultureInfo(c)).ToList(),
            SupportedUICultures = supportedCultures.Select(c => new System.Globalization.CultureInfo(c)).ToList(),
            RequestCultureProviders = new[]
            {
                new Microsoft.AspNetCore.Localization.AcceptLanguageHeaderRequestCultureProvider()
            }
        });
        
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();
        
        // Add health check endpoints
        app.UseHealthChecks("/health", new HealthCheckOptions
        {
            ResponseWriter = WriteHealthCheckResponse
        });
        
        app.UseHealthChecks("/health/database", new HealthCheckOptions
        {
            Predicate = (check) => check.Name == "database",
            ResponseWriter = WriteHealthCheckResponse
        });
        
        app.UseHealthChecks("/health/file-storage", new HealthCheckOptions
        {
            Predicate = (check) => check.Name == "file-storage",
            ResponseWriter = WriteHealthCheckResponse
        });

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            endpoints.MapHub<ChatHub>("/hubs/chat");
            endpoints.MapHub<NotificationHub>("/hubs/notifications");
        });
    }

    private void AddSwagger(IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Mulkchi API",
                Version = "v1",
                Description = "O'zbekiston ko'chmas mulk platformasi API\n\n" +
                             "Mulkchi Real Estate Platform API for property listings, bookings, analytics, and user management.\n\n" +
                             "**Features:**\n" +
                             "- Property listings with advanced search\n" +
                             "- User authentication with JWT tokens\n" +
                             "- Booking management system\n" +
                             "- Analytics and market insights\n" +
                             "- Multi-language support (Uzbek, Russian, English)\n" +
                             "- Rate limiting and security features",
                Contact = new OpenApiContact
                {
                    Name = "Mulkchi Team",
                    Email = "support@mulkchi.uz",
                    Url = new Uri("https://mulkchi.uz")
                },
                License = new OpenApiLicense
                {
                    Name = "MIT License",
                    Url = new Uri("https://opensource.org/licenses/MIT")
                }
            });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "JWT Authorization header using the Bearer scheme.\n\n" +
                             "Enter 'Bearer' [space] and then your token in the text input below.\n\n" +
                             "Example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });
    }

    private void AddJwtAuthentication(IServiceCollection services)
    {
        var jwtSettings = this.configuration.GetSection("JwtSettings");
        var secret = jwtSettings["Secret"]
            ?? throw new InvalidOperationException(
                "JwtSettings:Secret is not configured. " +
                "Add a 'JwtSettings' section with 'Secret', 'Issuer', 'Audience', and 'ExpiryDays' to appsettings.json.");
        var key = Encoding.UTF8.GetBytes(secret);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidateAudience = true,
                ValidAudience = jwtSettings["Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hub"))
                    {
                        context.Token = accessToken;
                    }
                    return Task.CompletedTask;
                }
            };
        });

        services.AddAuthorization();
    }

    private void AddBrokers(IServiceCollection services)
    {
        services.AddTransient<ILoggingBroker, LoggingBroker>();
        services.AddTransient<IDateTimeBroker, DateTimeBroker>();
        services.AddSingleton<IFileStorageBroker, LocalFileStorageBroker>();
    }

    private void AddFoundationServices(IServiceCollection services)
    {
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IPropertyService, PropertyService>();
        services.AddScoped<IHomeRequestService, HomeRequestService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<IMessageService, MessageService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IRentalContractService, RentalContractService>();
        services.AddScoped<IFavoriteService, FavoriteService>();
        services.AddScoped<ISavedSearchService, SavedSearchService>();
        services.AddScoped<IPropertyImageService, PropertyImageService>();
        services.AddScoped<IPropertyViewService, PropertyViewService>();
        services.AddScoped<IAiRecommendationService, AiRecommendationService>();
        services.AddScoped<IDiscountService, DiscountService>();
        services.AddScoped<IDiscountUsageService, DiscountUsageService>();
        services.AddScoped<IAnnouncementService, AnnouncementService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IBookingService, BookingService>();
        services.AddSingleton<IUserConnectionTracker, UserConnectionTracker>();
        
        // Configure EmailSettings
        services.Configure<EmailSettings>(this.configuration.GetSection("EmailSettings"));
        
        // Register email broker
        services.AddTransient<IEmailBroker, SmtpEmailBroker>();
    }

    private void AddDbContext(IServiceCollection services)
    {
        var connectionString = this.configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<StorageBroker>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<IStorageBroker, StorageBroker>();
    }

    private void AddCors(IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAngular", policy =>
            {
                policy
                    .WithOrigins(
                        "http://localhost:4200",
                        "https://localhost:4200"
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });

            options.AddPolicy("AllowAll", builder =>
            {
                builder
                    .AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });

            var allowedOrigins = this.configuration
                .GetSection("AllowedOrigins")
                .Get<string[]>();

            options.AddPolicy("Production", builder =>
            {
                if (allowedOrigins is { Length: > 0 })
                {
                    builder
                        .WithOrigins(allowedOrigins)
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                }
                else
                {
                    builder
                        .WithOrigins(Array.Empty<string>())
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                }
            });
        });
    }

    private static Task WriteHealthCheckResponse(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "application/json";

        var response = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(entry => new
            {
                name = entry.Key,
                status = entry.Value.Status.ToString(),
                description = entry.Value.Description,
                duration = entry.Value.Duration.TotalMilliseconds,
                data = entry.Value.Data
            }),
            totalDuration = report.TotalDuration.TotalMilliseconds
        };

        return context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
    }
}
