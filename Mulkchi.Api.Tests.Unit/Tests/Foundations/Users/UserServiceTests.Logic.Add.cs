using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Users;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Users;

public partial class UserServiceTests
{
    [Fact]
    public async Task ShouldAddUserAsync()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        User randomUser = CreateRandomUser();
        User inputUser = randomUser;
        inputUser.CreatedDate = randomDateTimeOffset;
        inputUser.UpdatedDate = randomDateTimeOffset;
        User expectedUser = inputUser;

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(randomDateTimeOffset);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertUserAsync(inputUser))
                .ReturnsAsync(expectedUser);

        // when
        User actualUser = await this.userService.AddUserAsync(inputUser);

        // then
        actualUser.Should().BeEquivalentTo(expectedUser);

        this.dateTimeBrokerMock.Verify(broker =>
            broker.GetCurrentDateTimeOffset(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertUserAsync(inputUser),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
