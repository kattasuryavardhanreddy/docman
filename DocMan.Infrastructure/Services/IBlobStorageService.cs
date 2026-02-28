using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace DocMan.Infrastructure.Services;

public interface IBlobStorageService
{
    Task UploadAsync(string path, Stream content, string contentType, CancellationToken ct = default);
    Task<Stream> DownloadAsync(string path, CancellationToken ct = default);
    Task DeleteAsync(string path, CancellationToken ct = default);
    Task<bool> IsReadyAsync(CancellationToken ct = default);
}