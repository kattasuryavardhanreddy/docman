using System.Security.Cryptography;
using DocMan.Core.Entities;
using DocMan.Infrastructure.Data;
using DocMan.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace DocMan.Worker;

public class DocumentProcessorWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DocumentProcessorWorker> _logger;
    private const int BatchSize = 10;
    private static readonly TimeSpan LoopDelay = TimeSpan.FromSeconds(10);
    private static readonly TimeSpan StuckThreshold = TimeSpan.FromMinutes(15);

    public DocumentProcessorWorker(IServiceProvider serviceProvider, ILogger<DocumentProcessorWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Document Processor Worker started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessBatchAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during worker iteration.");
            }

            await Task.Delay(LoopDelay, stoppingToken);
        }
    }

    private async Task ProcessBatchAsync(CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var blob = scope.ServiceProvider.GetRequiredService<IBlobStorageService>();

        var threshold = DateTime.UtcNow.Subtract(StuckThreshold);

        var candidates = await db.Documents
            .Where(d => d.Status == "Uploaded" || (d.Status == "Processing" && d.ProcessingStartedAtUtc < threshold))
            .OrderBy(d => d.UploadedAtUtc)
            .Take(BatchSize)
            .Select(d => new { d.DocumentId, d.OwnerUserId })
            .ToListAsync(ct);

        foreach (var candidate in candidates)
        {
            if (await TryClaimDocumentAsync(db, candidate.DocumentId, ct))
            {
                _logger.LogInformation("Claimed document {DocumentId} for user {UserId}", candidate.DocumentId, candidate.OwnerUserId);
                await ProcessDocumentAsync(db, blob, candidate.DocumentId, ct);
            }
        }
    }

    private async Task<bool> TryClaimDocumentAsync(AppDbContext db, Guid id, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var threshold = now.Subtract(StuckThreshold);

        var rows = await db.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE Documents 
            SET Status = 'Processing', ProcessingStartedAtUtc = {now}
            WHERE DocumentId = {id} AND (Status = 'Uploaded' OR (Status = 'Processing' AND ProcessingStartedAtUtc < {threshold}))", ct);

        return rows == 1;
    }

    private async Task ProcessDocumentAsync(AppDbContext db, IBlobStorageService blob, Guid docId, CancellationToken ct)
    {
        var doc = await db.Documents.FirstAsync(d => d.DocumentId == docId, ct);

        try
        {
            using var stream = await blob.DownloadAsync(doc.BlobPath, ct);
            using var sha256 = SHA256.Create();
            var hashBytes = await sha256.ComputeHashAsync(stream, ct);
            var hashHex = Convert.ToHexString(hashBytes).ToLower();

            doc.Status = "Processed";
            doc.Sha256 = hashHex;
            doc.ProcessedAtUtc = DateTime.UtcNow;
            doc.FailureReason = null;

            _logger.LogInformation("Processed document {DocumentId}. SHA256: {Hash}...", docId, hashHex[..8]);
        }
        catch (Exception ex)
        {
            doc.Status = "Failed";
            doc.FailureReason = ex is FileNotFoundException || ex.Message.Contains("blob_missing") ? "blob_missing" : "processing_error";
            _logger.LogWarning("Failed to process document {DocumentId}: {Reason}", docId, doc.FailureReason);
        }

        await db.SaveChangesAsync(ct);
    }
}
