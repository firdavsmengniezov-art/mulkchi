using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;
using Microsoft.AspNetCore.SignalR;
using Mulkchi.Api.Hubs;
using Mulkchi.Api.Middleware;
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
                options.JsonSerializerOptions.Converters.Add(
                    new System.Text.Json.Serialization.JsonStringEnumConverter());
            });
        services.AddEndpointsApiExplorer();
        AddSwagger(services);
        AddJwtAuthentication(services);
        AddDbContext(services);
        AddBrokers(services);
        AddFoundationServices(services);
        services.AddSignalR();
        services.AddSingleton<IUserIdProvider, JwtUserIdProvider>();
        AddCors(services);
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        app.UseMiddleware<RateLimitMiddleware>();
        app.UseCors(env.IsDevelopment() ? "AllowAngular" : "Production");
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            endpoints.MapHub<ChatHub>("/hub");
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
                Description = "Mulkchi Real Estate Platform API"
            });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter JWT token"
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
    }

    private void AddFoundationServices(IServiceCollection services)
    {
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
}
