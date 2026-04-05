using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Users;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Users;

public partial class UserServiceTests
{
    [Fact]
    public async Task ShouldRetrieveUserByIdAsync()
    {
        // given
        User randomUser = CreateRandomUser();
        User expectedUser = randomUser;

        this.storageBrokerMock.Setup(broker =>
            broker.SelectUserByIdAsync(randomUser.Id))
                .ReturnsAsync(expectedUser);

        // when
        UserResponse actualUser = await this.userService.RetrieveUserByIdAsync(randomUser.Id);

        // then
        actualUser.Id.Should().Be(expectedUser.Id);
        actualUser.Email.Should().Be(expectedUser.Email);
        actualUser.FirstName.Should().Be(expectedUser.FirstName);
        actualUser.LastName.Should().Be(expectedUser.LastName);
        actualUser.PhoneNumber.Should().Be(expectedUser.Phone);
        actualUser.AvatarUrl.Should().Be(expectedUser.AvatarUrl);
        actualUser.Bio.Should().Be(expectedUser.Bio);
        actualUser.Role.Should().Be(expectedUser.Role.ToString());
        actualUser.IsVerified.Should().Be(expectedUser.IsVerified);
        actualUser.CreatedDate.Should().Be(expectedUser.CreatedDate);
        actualUser.PropertiesCount.Should().Be(expectedUser.TotalListings);
        actualUser.AverageRating.Should().Be(expectedUser.Rating);
        actualUser.PreferredLanguage.Should().Be(expectedUser.PreferredLanguage);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectUserByIdAsync(randomUser.Id),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}

