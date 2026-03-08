using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Models.Foundations.RentalContracts;

namespace Mulkchi.Api.Brokers.Storages;

public partial class StorageBroker
{
    public DbSet<RentalContract> RentalContracts { get; set; }

    public async ValueTask<RentalContract> InsertRentalContractAsync(RentalContract rentalContract)
    {
        var entry = await this.RentalContracts.AddAsync(rentalContract);
        await this.SaveChangesAsync();
        return entry.Entity;
    }

    public IQueryable<RentalContract> SelectAllRentalContracts()
        => this.RentalContracts.AsQueryable();

    public async ValueTask<RentalContract> SelectRentalContractByIdAsync(Guid rentalContractId)
        => (await this.RentalContracts.FindAsync(rentalContractId))!;

    public async ValueTask<RentalContract> UpdateRentalContractAsync(RentalContract rentalContract)
    {
        this.Entry(rentalContract).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return rentalContract;
    }

    public async ValueTask<RentalContract> DeleteRentalContractByIdAsync(Guid rentalContractId)
    {
        RentalContract rentalContract = (await this.RentalContracts.FindAsync(rentalContractId))!;
        rentalContract.DeletedDate = DateTimeOffset.UtcNow;
        this.Entry(rentalContract).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return rentalContract;
    }
}
