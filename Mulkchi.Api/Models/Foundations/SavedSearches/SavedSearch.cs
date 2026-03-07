#nullable disable

namespace Mulkchi.Api.Models.Foundations.SavedSearches;

public class SavedSearch
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string SearchQuery { get; set; }
    public bool NotifyOnMatch { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public DateTimeOffset UpdatedDate { get; set; }
    public DateTimeOffset? DeletedDate { get; set; }
}
