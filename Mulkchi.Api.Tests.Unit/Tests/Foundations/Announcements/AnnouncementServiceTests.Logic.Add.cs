using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Announcements;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Announcements;

public partial class AnnouncementServiceTests
{
    [Fact]
    public async Task ShouldAddAnnouncementAsync()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        Announcement randomAnnouncement = CreateRandomAnnouncement();
        Announcement inputAnnouncement = randomAnnouncement;
        inputAnnouncement.CreatedDate = randomDateTimeOffset;
        inputAnnouncement.UpdatedDate = randomDateTimeOffset;
        Announcement expectedAnnouncement = inputAnnouncement;

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(randomDateTimeOffset);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertAnnouncementAsync(inputAnnouncement))
                .ReturnsAsync(expectedAnnouncement);

        // when
        Announcement actualAnnouncement = await this.announcementService.AddAnnouncementAsync(inputAnnouncement);

        // then
        actualAnnouncement.Should().BeEquivalentTo(expectedAnnouncement);

        this.dateTimeBrokerMock.Verify(broker =>
            broker.GetCurrentDateTimeOffset(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertAnnouncementAsync(inputAnnouncement),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
