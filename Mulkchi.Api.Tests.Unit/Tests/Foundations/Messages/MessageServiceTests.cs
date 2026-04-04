using System.Runtime.CompilerServices;
using Microsoft.Data.SqlClient;
using Moq;
using Tynamix.ObjectFiller;
using FluentAssertions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;
using Mulkchi.Api.Models.Foundations.Messages;
using Mulkchi.Api.Services.Foundations.Messages;
using Mulkchi.Api.Services.Foundations.Auth;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Messages;

public partial class MessageServiceTests
{
    private readonly Mock<IStorageBroker> storageBrokerMock;
    private readonly Mock<ILoggingBroker> loggingBrokerMock;
    private readonly Mock<IDateTimeBroker> dateTimeBrokerMock;
    private readonly Mock<ICurrentUserService> currentUserServiceMock;
    private readonly IMessageService messageService;

    public MessageServiceTests()
    {
        this.storageBrokerMock = new Mock<IStorageBroker>();
        this.loggingBrokerMock = new Mock<ILoggingBroker>();
        this.dateTimeBrokerMock = new Mock<IDateTimeBroker>();
        this.currentUserServiceMock = new Mock<ICurrentUserService>();
        this.messageService = new MessageService(
            this.storageBrokerMock.Object,
            this.loggingBrokerMock.Object,
            this.dateTimeBrokerMock.Object,
            this.currentUserServiceMock.Object);
    }

    private static Message CreateRandomMessage()
    {
        var filler = new Filler<Message>();
        filler.Setup()
            .OnType<DateTimeOffset>().Use(() => DateTimeOffset.UtcNow)
            .OnType<DateTimeOffset?>().Use(() => (DateTimeOffset?)DateTimeOffset.UtcNow);

        return filler.Create();
    }

    private static SqlException CreateSqlException() =>
        (SqlException)RuntimeHelpers.GetUninitializedObject(typeof(SqlException));
}
