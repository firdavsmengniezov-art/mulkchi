using Mulkchi.Api.Models.Foundations.Auth;

namespace Mulkchi.Api.Brokers.Storages;

public partial interface IStorageBroker
{
    ValueTask<UserRefreshToken> InsertRefreshTokenAsync(UserRefreshToken token);
    ValueTask<UserRefreshToken?> SelectRefreshTokenAsync(string token);
    ValueTask<UserRefreshToken> UpdateRefreshTokenAsync(UserRefreshToken token);
}
