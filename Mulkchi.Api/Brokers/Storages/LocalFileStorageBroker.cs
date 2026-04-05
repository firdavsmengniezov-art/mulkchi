using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using System.IO;
using System.Threading.Tasks;

namespace Mulkchi.Api.Brokers.Storages;

public class LocalFileStorageBroker : IFileStorageBroker
{
    private readonly IHostEnvironment environment;
    private readonly string[] allowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
    private const long maxFileSize = 5 * 1024 * 1024; // 5MB

    public LocalFileStorageBroker(IHostEnvironment environment)
    {
        this.environment = environment;
    }

    public async Task<string> UploadImageAsync(IFormFile file, string folder)
    {
        ValidateFile(file);

        string uploadsFolder = Path.Combine(environment.ContentRootPath, "wwwroot", "uploads", folder);
        Directory.CreateDirectory(uploadsFolder);

        string fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        string uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
        string filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(fileStream);
        }

        // Return relative URL
        return $"/uploads/{folder}/{uniqueFileName}";
    }

    public Task DeleteImageAsync(string imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl))
            return Task.CompletedTask;

        string filePath = Path.Combine(environment.ContentRootPath, "wwwroot", imageUrl.TrimStart('/'));

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        return Task.CompletedTask;
    }

    public async ValueTask<string> UploadFileAsync(IFormFile file, string path)
    {
        var uploadsFolder = Path.Combine(environment.ContentRootPath, "wwwroot", path);
        Directory.CreateDirectory(uploadsFolder);

        string uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName).ToLowerInvariant()}";
        string filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(fileStream);
        }

        return $"/{path}/{uniqueFileName}";
    }

    public ValueTask DeleteFileAsync(string filePath)
    {
        if (string.IsNullOrEmpty(filePath))
            return ValueTask.CompletedTask;

        string fullPath = Path.Combine(environment.ContentRootPath, "wwwroot", filePath.TrimStart('/'));

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        return ValueTask.CompletedTask;
    }

    private void ValidateFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is required.");

        if (file.Length > maxFileSize)
            throw new ArgumentException($"File size cannot exceed {maxFileSize / (1024 * 1024)}MB.");

        string fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        
        if (!allowedExtensions.Contains(fileExtension))
            throw new ArgumentException($"Only {string.Join(", ", allowedExtensions)} files are allowed.");
    }
}
