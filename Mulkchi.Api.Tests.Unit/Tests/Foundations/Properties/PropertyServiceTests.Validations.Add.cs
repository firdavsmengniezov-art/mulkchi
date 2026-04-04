using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.Properties.Exceptions;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Properties;

public partial class PropertyServiceTests
{
    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenNullProperty()
    {
        // given
        Property? inputProperty = null;

        // when
        ValueTask<Property> addPropertyTask =
            this.propertyService.AddPropertyAsync(inputProperty!);

        // then
        PropertyValidationException actualException =
            await Assert.ThrowsAsync<PropertyValidationException>(
                testCode: async () => await addPropertyTask);

        actualException.InnerException.Should().BeOfType<NullPropertyException>();

        this.storageBrokerMock.Verify(broker =>
            broker.InsertPropertyAsync(It.IsAny<Property>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
