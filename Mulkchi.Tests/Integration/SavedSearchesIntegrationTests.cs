using Mulkchi.Api;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Xunit;
using Mulkchi.Api.Models.Foundations.SavedSearches;
using Mulkchi.Api.Models.Foundations.Users;
using Mulkchi.Api.Brokers.Storages;

namespace Mulkchi.Tests.Integration
{
    public class SavedSearchesIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public SavedSearchesIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseSetting("environment", "Testing");
                builder.ConfigureServices(services =>
                {
                    var descriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<StorageBroker>));
                    if (descriptor != null)
                        services.Remove(descriptor);
                    services.AddDbContext<StorageBroker>(options =>
                        options.UseInMemoryDatabase("TestDb"));
                    var sp = services.BuildServiceProvider();
                    using var scope = sp.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<StorageBroker>();
                    db.Database.EnsureCreated();
                    SeedTestData(db);
                });
            });
            _client = _factory.CreateClient();
        }

        private void SeedTestData(StorageBroker context)
        {
            if (!context.Users.Any())
            {
                context.Users.Add(new User
                {
                    Id = Guid.NewGuid(),
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
            var savedSearch = new { Name = "Toshkent kvartiralari", City = "Toshkent", MinPrice = 5000000, MaxPrice = 15000000, MinArea = 50, MaxArea = 100, MinBedrooms = 2, IsActive = true, NotifyByEmail = true, NotifyByPush = true };
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
            var searches = JsonConvert.DeserializeObject<List<SavedSearch>>(await response.Content.ReadAsStringAsync());
            Assert.NotNull(searches);
            Assert.True(searches.Count >= 1);
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
            var response = await _client.PutAsync($"/api/savedsearches/{createdSearch.Id}", content);
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
            var content = new StringContent(JsonConvert.SerializeObject(new { Name = "", City = "Toshkent" }), Encoding.UTF8, "application/json");
            var response = await _client.PostAsync("/api/savedsearches", content);
            Assert.Equal(400, (int)response.StatusCode);
        }

        private async Task<SavedSearch> CreateTestSavedSearch()
        {
            var savedSearch = new { Name = "Test qidiruv", City = "Toshkent", MinPrice = 5000000, MaxPrice = 15000000, MinArea = 50, MaxArea = 100, MinBedrooms = 2, IsActive = true, NotifyByEmail = true, NotifyByPush = true };
            var content = new StringContent(JsonConvert.SerializeObject(savedSearch), Encoding.UTF8, "application/json");
            var response = await _client.PostAsync("/api/savedsearches", content);
            response.EnsureSuccessStatusCode();
            return JsonConvert.DeserializeObject<SavedSearch>(await response.Content.ReadAsStringAsync())!;
        }
    }
}
