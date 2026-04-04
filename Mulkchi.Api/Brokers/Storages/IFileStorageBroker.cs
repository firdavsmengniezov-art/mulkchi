using Microsoft.AspNetCore.Http;

namespace Mulkchi.Api.Brokers.Storages;

public interface IFileStorageBroker
{
    Task<string> UploadImageAsync(IFormFile file, string folder);
    Task DeleteImageAsync(string imageUrl);
}
