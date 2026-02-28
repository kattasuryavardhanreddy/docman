using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using DocMan.Infrastructure.Configuration;
using Microsoft.Extensions.Options;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace DocMan.Infrastructure.Services;

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobContainerClient _containerClient;
    private readonly SemaphoreSlim _initSemaphore = new(1, 1);
    private bool _containerCreated = false;

    public BlobStorageService(IOptions<BlobOptions> options)
    {
        var blobClient = new BlobServiceClient(options.Value.ConnectionString);
        _containerClient = blobClient.GetBlobContainerClient(options.Value.ContainerName);
    }

    private async Task EnsureContainerAsync(CancellationToken ct)
    {
        if (_containerCreated) return;
        await _initSemaphore.WaitAsync(ct);
        try
        {
            if (!_containerCreated)
            {
                await _containerClient.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: ct);
                _containerCreated = true;
            }
        }
        finally { _initSemaphore.Release(); }
    }

    public async Task UploadAsync(string path, Stream content, string contentType, CancellationToken ct = default)
    {
        await EnsureContainerAsync(ct);
        var blobClient = _containerClient.GetBlobClient(path);
        await blobClient.UploadAsync(content, new BlobHttpHeaders { ContentType = contentType }, cancellationToken: ct);
    }

    public async Task<Stream> DownloadAsync(string path, CancellationToken ct = default)
    {
        await EnsureContainerAsync(ct);
        var blobClient = _containerClient.GetBlobClient(path);
        return await blobClient.OpenReadAsync(cancellationToken: ct);
    }

    public async Task DeleteAsync(string path, CancellationToken ct = default)
    {
        await EnsureContainerAsync(ct);
        var blobClient = _containerClient.GetBlobClient(path);
        await blobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots, cancellationToken: ct);
    }

    public async Task<bool> IsReadyAsync(CancellationToken ct = default)
    {
        try { await EnsureContainerAsync(ct); return await _containerClient.ExistsAsync(ct); }
        catch { return false; }
    }
}