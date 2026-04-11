using System;
using System.Security.Claims;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using Mulkchi.Api.Controllers;
using Mulkchi.Api.Models.Foundations.SavedSearches;
using Mulkchi.Api.Services.Foundations.SavedSearches;
using Mulkchi.Api.Models.Foundations.Common;

namespace Mulkchi.Api.Tests.Unit.Controllers
{
    public class SavedSearchesControllerTests
    {
        private readonly Mock<ISavedSearchService> savedSearchServiceMock;
        private readonly SavedSearchesController controller;
        private readonly Guid currentUserId;

        public SavedSearchesControllerTests()
        {
            this.savedSearchServiceMock = new Mock<ISavedSearchService>();
            this.currentUserId = Guid.NewGuid();
            this.controller = new SavedSearchesController(savedSearchServiceMock.Object);
            SetupControllerUser();
        }

        private void SetupControllerUser()
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, this.currentUserId.ToString())
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var user = new ClaimsPrincipal(identity);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task ShouldCreateSavedSearch()
        {
            // Arrange
            var savedSearch = new SavedSearch
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Name = "Test Search",
                City = "Tashkent",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            this.savedSearchServiceMock
                .Setup(service => service.AddSavedSearchAsync(It.IsAny<SavedSearch>()))
                .ReturnsAsync(savedSearch);

            // Act
            var result = await controller.PostSavedSearchAsync(savedSearch);

            // Assert
            var createdResult = result.Result.Should().BeOfType<CreatedResult>().Subject;
            createdResult.StatusCode.Should().Be(201);
            createdResult.Value.Should().BeEquivalentTo(savedSearch, options => options.Excluding(x => x.CreatedAt).Excluding(x => x.UpdatedAt));
        }

        [Fact]
        public void ShouldGetAllSavedSearches()
        {
            // Arrange
            var savedSearches = new[]
            {
                new SavedSearch { Id = Guid.NewGuid(), UserId = this.currentUserId, Name = "Search 1" },
                new SavedSearch { Id = Guid.NewGuid(), UserId = this.currentUserId, Name = "Search 2" }
            };

            this.savedSearchServiceMock
                .Setup(service => service.RetrieveAllSavedSearches())
                .Returns(savedSearches.AsQueryable());

            var pagination = new PaginationParams { Page = 1, PageSize = 10 };

            // Act
            var result = controller.GetAllSavedSearches(pagination);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var pagedResult = okResult.Value.Should().BeOfType<PagedResult<SavedSearch>>().Subject;
            pagedResult.Items.Should().HaveCount(2);
            pagedResult.TotalCount.Should().Be(2);
        }

        [Fact]
        public async Task ShouldGetSavedSearchById()
        {
            // Arrange
            var savedSearchId = Guid.NewGuid();
            var savedSearch = new SavedSearch
            {
                Id = savedSearchId,
                UserId = this.currentUserId,
                Name = "Test Search",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            this.savedSearchServiceMock
                .Setup(service => service.RetrieveSavedSearchByIdAsync(savedSearchId))
                .ReturnsAsync(savedSearch);

            // Act
            var result = await controller.GetSavedSearchByIdAsync(savedSearchId);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(savedSearch, options => options.Excluding(x => x.CreatedAt).Excluding(x => x.UpdatedAt));
        }

        [Fact]
        public async Task ShouldUpdateSavedSearch()
        {
            // Arrange
            var savedSearch = new SavedSearch
            {
                Id = Guid.NewGuid(),
                UserId = this.currentUserId,
                Name = "Updated Search",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            this.savedSearchServiceMock
                .Setup(service => service.ModifySavedSearchAsync(It.IsAny<SavedSearch>()))
                .ReturnsAsync(savedSearch);

            // Act
            var result = await controller.PutSavedSearchAsync(savedSearch);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(savedSearch, options => options.Excluding(x => x.CreatedAt).Excluding(x => x.UpdatedAt));
        }

        [Fact]
        public async Task ShouldDeleteSavedSearch()
        {
            // Arrange
            var savedSearchId = Guid.NewGuid();
            var savedSearch = new SavedSearch
            {
                Id = savedSearchId,
                UserId = this.currentUserId,
                Name = "Test Search",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            this.savedSearchServiceMock
                .Setup(service => service.RemoveSavedSearchByIdAsync(savedSearchId))
                .ReturnsAsync(savedSearch);

            // Act
            var result = await controller.DeleteSavedSearchByIdAsync(savedSearchId);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(savedSearch, options => options.Excluding(x => x.CreatedAt).Excluding(x => x.UpdatedAt));
        }

        [Fact]
        public async Task ShouldToggleSavedSearch()
        {
            // Arrange
            var savedSearchId = Guid.NewGuid();
            var savedSearch = new SavedSearch
            {
                Id = savedSearchId,
                UserId = this.currentUserId,
                Name = "Test Search",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            this.savedSearchServiceMock
                .Setup(service => service.RetrieveSavedSearchByIdAsync(savedSearchId))
                .ReturnsAsync(savedSearch);

            this.savedSearchServiceMock
                .Setup(service => service.ModifySavedSearchAsync(It.IsAny<SavedSearch>()))
                .ReturnsAsync(savedSearch);

            // Act
            var result = await controller.ToggleSavedSearchAsync(savedSearchId);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(savedSearch, options => options.Excluding(x => x.CreatedAt).Excluding(x => x.UpdatedAt));
        }
    }
}
