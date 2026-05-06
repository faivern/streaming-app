namespace backend.Services;

public interface IEmbeddingSeedService
{
    Task RunAsync(CancellationToken ct);
}
