using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Mulkchi.Api;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Models.Foundations.Common;
using Mulkchi.Api.Models.Foundations.SavedSearches;
using Mulkchi.Api.Models.Foundations.Users;
using Microsoft.AspNetCore.Mvc.Testing;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using Xunit;

namespace Mulkchi.Tests.Integration
{
    public class SavedSearchesIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private static readonly Guid TestUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        private const string JwtSecretFallback = "test-secret-key-for-mulkchi-tests-01234567890123456789";
        private const string JwtIssuer = "Mulkchi";
        private const string JwtAudience = "MulkchiUsers";
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public SavedSearchesIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseSetting("environment", "Testing");
                builder.ConfigureServices(services =>
                {
                    var sp = services.BuildServiceProvider();
                    using var scope = sp.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<StorageBroker>();
                    db.Database.EnsureCreated();
                    SeedTestData(db);
                });
            });
            _client = _factory.CreateClient();
            _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", CreateJwtToken());
        }

        private void SeedTestData(StorageBroker context)
        {
            if (!context.Users.Any())
            {
                context.Users.Add(new User
                {
                    Id = TestUserId,
                    FirstName = "Test",
                    LastName = "User",
                    Email = "test@example.com",
                    Phone = "+998901234567",
                    Role = UserRole.Guest,
                    IsVerified = true,
                    CreatedDate = DateTimeOffset.UtcNow,
                    UpdatedDate = DateTimeOffset.UtcNow
                });
                context.SaveChanges();
            }
        }

        [Fact]
        public async Task ShouldCreateSavedSearch()
        {
            var savedSearch = new { Id = Guid.NewGuid(), UserId = TestUserId, Name = "Toshkent kvartiralari", City = "Toshkent", MinPrice = 5000000, MaxPrice = 15000000, MinArea = 50, MaxArea = 100, MinBedrooms = 2, IsActive = true, NotifyByEmail = true, NotifyByPush = true };
            var content = new StringContent(JsonConvert.SerializeObject(savedSearch), Encoding.UTF8, "application/json");
            var response = await _client.PostAsync("/api/savedsearches", content);
            response.EnsureSuccessStatusCode();
            var createdSearch = JsonConvert.DeserializeObject<SavedSearch>(await response.Content.ReadAsStringAsync());
            Assert.NotNull(createdSearch);
            Assert.Equal(savedSearch.Name, createdSearch.Name);
            Assert.NotEqual(Guid.Empty, createdSearch.Id);
        }

        [Fact]
        public async Task ShouldGetAllSavedSearches()
        {
            await CreateTestSavedSearch();
            var response = await _client.GetAsync("/api/savedsearches");
            response.EnsureSuccessStatusCode();
            var searches = JsonConvert.DeserializeObject<PagedResult<SavedSearch>>(await response.Content.ReadAsStringAsync());
            Assert.NotNull(searches);
            Assert.NotNull(searches.Items);
            Assert.True(searches.Items.Any());
        }

        [Fact]
        public async Task ShouldGetSavedSearchById()
        {
            var createdSearch = await CreateTestSavedSearch();
            var response = await _client.GetAsync($"/api/savedsearches/{createdSearch.Id}");
            response.EnsureSuccessStatusCode();
            var retrieved = JsonConvert.DeserializeObject<SavedSearch>(await response.Content.ReadAsStringAsync());
            Assert.NotNull(retrieved);
            Assert.Equal(createdSearch.Id, retrieved.Id);
        }

        [Fact]
        public async Task ShouldUpdateSavedSearch()
        {
            var createdSearch = await CreateTestSavedSearch();
            var updated = new { Id = createdSearch.Id, Name = "Yangilangan qidiruv", City = "Samarqand", MinPrice = 100000000, MaxPrice = 500000000, MinArea = 100, MaxArea = 200, MinBedrooms = 3, IsActive = true, NotifyByEmail = true, NotifyByPush = false };
            var content = new StringContent(JsonConvert.SerializeObject(updated), Encoding.UTF8, "application/json");
            var response = await _client.PutAsync("/api/savedsearches", content);
            response.EnsureSuccessStatusCode();
            var result = JsonConvert.DeserializeObject<SavedSearch>(await response.Content.ReadAsStringAsync());
            Assert.NotNull(result);
            Assert.Equal(updated.Name, result.Name);
        }

        [Fact]
        public async Task ShouldToggleSavedSearch()
        {
            var createdSearch = await CreateTestSavedSearch();
            var response = await _client.PutAsync($"/api/savedsearches/{createdSearch.Id}/toggle", null);
            response.EnsureSuccessStatusCode();
            var toggled = JsonConvert.DeserializeObject<SavedSearch>(await response.Content.ReadAsStringAsync());
            Assert.NotNull(toggled);
            Assert.NotEqual(createdSearch.IsActive, toggled.IsActive);
        }

        [Fact]
        public async Task ShouldDeleteSavedSearch()
        {
            var createdSearch = await CreateTestSavedSearch();
            var response = await _client.DeleteAsync($"/api/savedsearches/{createdSearch.Id}");
            response.EnsureSuccessStatusCode();
            var deleted = JsonConvert.DeserializeObject<SavedSearch>(await response.Content.ReadAsStringAsync());
            Assert.NotNull(deleted);
            Assert.NotNull(deleted.DeletedAt);
        }

        [Fact]
        public async Task ShouldReturnNotFoundForNonExistentSearch()
        {
            var response = await _client.GetAsync($"/api/savedsearches/{Guid.NewGuid()}");
            Assert.Equal(404, (int)response.StatusCode);
        }

        [Fact]
        public async Task ShouldValidateRequiredFields()
        {
            var content = new StringContent(JsonConvert.SerializeObject(new { Id = Guid.NewGuid(), UserId = TestUserId, Name = "", City = "Toshkent" }), Encoding.UTF8, "application/json");
            var response = await _client.PostAsync("/api/savedsearches", content);
            Assert.Equal(400, (int)response.StatusCode);
        }

        private async Task<SavedSearch> CreateTestSavedSearch()
        {
            var savedSearch = new { Id = Guid.NewGuid(), UserId = TestUserId, Name = "Test qidiruv", City = "Toshkent", MinPrice = 5000000, MaxPrice = 15000000, MinArea = 50, MaxArea = 100, MinBedrooms = 2, IsActive = true, NotifyByEmail = true, NotifyByPush = true };
            var content = new StringContent(JsonConvert.SerializeObject(savedSearch), Encoding.UTF8, "application/json");
            var response = await _client.PostAsync("/api/savedsearches", content);
            response.EnsureSuccessStatusCode();
            return JsonConvert.DeserializeObject<SavedSearch>(await response.Content.ReadAsStringAsync())!;
        }

        private static string CreateJwtToken()
        {
            var jwtSecret = Environment.GetEnvironmentVariable("JwtSettings__Secret")
                ?? Environment.GetEnvironmentVariable("MULKCHI_JWT_SECRET")
                ?? JwtSecretFallback;

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, TestUserId.ToString()),
                new Claim(ClaimTypes.Email, "test.user@example.com"),
                new Claim(ClaimTypes.Name, "test.user@example.com")
            };

            var token = new JwtSecurityToken(
                issuer: JwtIssuer,
                audience: JwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
