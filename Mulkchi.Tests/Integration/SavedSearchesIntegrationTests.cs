using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
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
                builder.ConfigureServices(services =>
                {
                    // Remove the existing DbContext registration
                    var descriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<StorageBroker>));
                    
                    if (descriptor != null)
                    {
                        services.Remove(descriptor);
                    }

                    // Add in-memory database for testing
                    services.AddDbContext<StorageBroker>(options =>
                    {
                        options.UseInMemoryDatabase("TestDb");
                    });

                    // Create a scope to get the database context
                    var sp = services.BuildServiceProvider();
                    using (var scope = sp.CreateScope())
                    {
                        var scopedServices = scope.ServiceProvider;
                        var db = scopedServices.GetRequiredService<StorageBroker>();

                        // Ensure the database is created
                        db.Database.EnsureCreated();

                        // Seed test data
                        SeedTestData(db);
                    }
                });
            });

            _client = _factory.CreateClient();
        }

        private void SeedTestData(StorageBroker context)
        {
            // Add test user
            if (!context.Users.Any())
            {
                var testUser = new User
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Test",
                    LastName = "User",
                    Email = "test@example.com",
                    Phone = "+998901234567",
                    Role = "User",
                    IsEmailVerified = true,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };
                context.Users.Add(testUser);
                context.SaveChanges();
            }
        }

        [Fact]
        public async Task ShouldCreateSavedSearch()
        {
            // Arrange
            var savedSearch = new
            {
                Name = "Toshkent kvartiralari",
                City = "Toshkent",
                Type = "Apartment",
                ListingType = "Rent",
                MinPrice = 5000000,
                MaxPrice = 15000000,
                MinArea = 50,
                MaxArea = 100,
                MinBedrooms = 2,
                IsActive = true,
                NotifyByEmail = true,
                NotifyByPush = true
            };

            var json = JsonConvert.SerializeObject(savedSearch);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/savedsearches", content);

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            var createdSearch = JsonConvert.DeserializeObject<SavedSearch>(responseContent);
            
            Assert.NotNull(createdSearch);
            Assert.Equal(savedSearch.Name, createdSearch.Name);
            Assert.Equal(savedSearch.City, createdSearch.City);
            Assert.NotEqual(Guid.Empty, createdSearch.Id);
        }

        [Fact]
        public async Task ShouldGetAllSavedSearches()
        {
            // Arrange
            await CreateTestSavedSearch();

            // Act
            var response = await _client.GetAsync("/api/savedsearches");

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            var searches = JsonConvert.DeserializeObject<List<SavedSearch>>(responseContent);
            
            Assert.NotNull(searches);
            Assert.True(searches.Count >= 1);
        }

        [Fact]
        public async Task ShouldGetSavedSearchById()
        {
            // Arrange
            var createdSearch = await CreateTestSavedSearch();

            // Act
            var response = await _client.GetAsync($"/api/savedsearches/{createdSearch.Id}");

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            var retrievedSearch = JsonConvert.DeserializeObject<SavedSearch>(responseContent);
            
            Assert.NotNull(retrievedSearch);
            Assert.Equal(createdSearch.Id, retrievedSearch.Id);
            Assert.Equal(createdSearch.Name, retrievedSearch.Name);
        }

        [Fact]
        public async Task ShouldUpdateSavedSearch()
        {
            // Arrange
            var createdSearch = await CreateTestSavedSearch();
            
            var updatedSearch = new
            {
                Id = createdSearch.Id,
                Name = "Yangilangan qidiruv",
                City = "Samarqand",
                Type = "House",
                ListingType = "Sale",
                MinPrice = 100000000,
                MaxPrice = 500000000,
                MinArea = 100,
                MaxArea = 200,
                MinBedrooms = 3,
                IsActive = true,
                NotifyByEmail = true,
                NotifyByPush = false
            };

            var json = JsonConvert.SerializeObject(updatedSearch);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PutAsync($"/api/savedsearches/{createdSearch.Id}", content);

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            var updatedResult = JsonConvert.DeserializeObject<SavedSearch>(responseContent);
            
            Assert.NotNull(updatedResult);
            Assert.Equal(updatedSearch.Name, updatedResult.Name);
            Assert.Equal(updatedSearch.City, updatedResult.City);
            Assert.Equal(updatedSearch.Type, updatedResult.Type);
        }

        [Fact]
        public async Task ShouldToggleSavedSearch()
        {
            // Arrange
            var createdSearch = await CreateTestSavedSearch();

            // Act
            var response = await _client.PutAsync($"/api/savedsearches/{createdSearch.Id}/toggle", null);

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            var toggledSearch = JsonConvert.DeserializeObject<SavedSearch>(responseContent);
            
            Assert.NotNull(toggledSearch);
            Assert.NotEqual(createdSearch.IsActive, toggledSearch.IsActive);
        }

        [Fact]
        public async Task ShouldDeleteSavedSearch()
        {
            // Arrange
            var createdSearch = await CreateTestSavedSearch();

            // Act
            var response = await _client.DeleteAsync($"/api/savedsearches/{createdSearch.Id}");

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            var deletedSearch = JsonConvert.DeserializeObject<SavedSearch>(responseContent);
            
            Assert.NotNull(deletedSearch);
            Assert.NotNull(deletedSearch.DeletedAt);
        }

        [Fact]
        public async Task ShouldReturnNotFoundForNonExistentSearch()
        {
            // Act
            var response = await _client.GetAsync($"/api/savedsearches/{Guid.NewGuid()}");

            // Assert
            Assert.Equal(404, (int)response.StatusCode);
        }

        [Fact]
        public async Task ShouldValidateRequiredFields()
        {
            // Arrange
            var invalidSearch = new
            {
                Name = "", // Invalid: empty name
                City = "Toshkent"
            };

            var json = JsonConvert.SerializeObject(invalidSearch);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/savedsearches", content);

            // Assert
            Assert.Equal(400, (int)response.StatusCode);
        }

        private async Task<SavedSearch> CreateTestSavedSearch()
        {
            var savedSearch = new
            {
                Name = "Test qidiruv",
                City = "Toshkent",
                Type = "Apartment",
                ListingType = "Rent",
                MinPrice = 5000000,
                MaxPrice = 15000000,
                MinArea = 50,
                MaxArea = 100,
                MinBedrooms = 2,
                IsActive = true,
                NotifyByEmail = true,
                NotifyByPush = true
            };

            var json = JsonConvert.SerializeObject(savedSearch);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _client.PostAsync("/api/savedsearches", content);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<SavedSearch>(responseContent);
        }
    }
}
