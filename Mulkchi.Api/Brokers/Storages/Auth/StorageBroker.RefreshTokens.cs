using Microsoft.EntityFrameworkCore;
using Mulkchi.Api.Models.Foundations.Auth;

namespace Mulkchi.Api.Brokers.Storages;

public partial class StorageBroker
{
    public DbSet<UserRefreshToken> UserRefreshTokens { get; set; }

    public async ValueTask<UserRefreshToken> InsertRefreshTokenAsync(UserRefreshToken token)
    {
        var entry = await this.UserRefreshTokens.AddAsync(token);
        await this.SaveChangesAsync();
        return entry.Entity;
    }

    public async ValueTask<UserRefreshToken?> SelectRefreshTokenAsync(string token)
        => await this.UserRefreshTokens.FirstOrDefaultAsync(t => t.Token == token);

    public async ValueTask<UserRefreshToken> UpdateRefreshTokenAsync(UserRefreshToken token)
    {
        this.Entry(token).State = EntityState.Modified;
        await this.SaveChangesAsync();
        return token;
    }
}
