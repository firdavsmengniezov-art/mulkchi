namespace Mulkchi.Api.Models.Foundations.Common;

public class PaginationParams
{
    private int page = 1;
    private int pageSize = 20;

    public int Page
    {
        get => page;
        set => page = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => pageSize;
        set => pageSize = value > 100 ? 100 : value < 1 ? 1 : value;
    }
}
