using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.PropertyViews;
using Mulkchi.Api.Models.Foundations.PropertyViews.Exceptions;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.PropertyViews;

public partial class PropertyViewServiceTests
{
    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenNullPropertyView()
    {
        // given
        PropertyView? inputPropertyView = null;

        // when
        ValueTask<PropertyView> addPropertyViewTask =
            this.propertyViewService.AddPropertyViewAsync(inputPropertyView!);

        // then
        PropertyViewValidationException actualException =
            await Assert.ThrowsAsync<PropertyViewValidationException>(
                testCode: async () => await addPropertyViewTask);

        actualException.InnerException.Should().BeOfType<NullPropertyViewException>();

        this.storageBrokerMock.Verify(broker =>
            broker.InsertPropertyViewAsync(It.IsAny<PropertyView>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenIdIsEmpty()
    {
        // given
        PropertyView randomPropertyView = CreateRandomPropertyView();
        randomPropertyView.Id = Guid.Empty;

        // when
        ValueTask<PropertyView> addPropertyViewTask =
            this.propertyViewService.AddPropertyViewAsync(randomPropertyView);

        // then
        await Assert.ThrowsAsync<PropertyViewValidationException>(
            testCode: async () => await addPropertyViewTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertPropertyViewAsync(It.IsAny<PropertyView>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenPropertyIdIsEmpty()
    {
        // given
        PropertyView randomPropertyView = CreateRandomPropertyView();
        randomPropertyView.PropertyId = Guid.Empty;

        // when
        ValueTask<PropertyView> addPropertyViewTask =
            this.propertyViewService.AddPropertyViewAsync(randomPropertyView);

        // then
        await Assert.ThrowsAsync<PropertyViewValidationException>(
            testCode: async () => await addPropertyViewTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertPropertyViewAsync(It.IsAny<PropertyView>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowValidationException_OnAdd_WhenIpAddressIsEmpty()
    {
        // given
        PropertyView randomPropertyView = CreateRandomPropertyView();
        randomPropertyView.IpAddress = string.Empty;

        // when
        ValueTask<PropertyView> addPropertyViewTask =
            this.propertyViewService.AddPropertyViewAsync(randomPropertyView);

        // then
        await Assert.ThrowsAsync<PropertyViewValidationException>(
            testCode: async () => await addPropertyViewTask);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertPropertyViewAsync(It.IsAny<PropertyView>()),
            Times.Never);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
