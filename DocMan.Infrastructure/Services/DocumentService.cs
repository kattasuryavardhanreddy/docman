using DocMan.Core.DTOs;
using DocMan.Core.Entities;
using DocMan.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace DocMan.Infrastructure.Services;

public class DocumentService : IDocumentService
{
    private readonly AppDbContext _db;
    private readonly IBlobStorageService _blob;
    private readonly ICacheService _cache;

    public DocumentService(AppDbContext db, IBlobStorageService blob, ICacheService cache)
    {
        _db = db;
        _blob = blob;
        _cache = cache;
    }

    public async Task<DocumentDto> CreateDocumentAsync(Guid userId, string fileName, Stream content, UploadMetadata? meta, CancellationToken ct)
    {
        var docId = Guid.NewGuid();
        var blobPath = $"pdfs/{userId}/{docId}.pdf";
        var size = content.Length;

        await _blob.UploadAsync(blobPath, content, "application/pdf", ct);

        var doc = new Document
        {
            DocumentId = docId,
            OwnerUserId = userId,
            OriginalFileName = fileName,
            Title = meta?.Title,
            TagsJson = meta?.Tags != null ? JsonSerializer.Serialize(NormalizeTags(meta.Tags)) : null,
            BlobPath = blobPath,
            SizeBytes = size,
            Status = "Uploaded",
            UploadedAtUtc = DateTime.UtcNow
        };

        try
        {
            _db.Documents.Add(doc);
            await _db.SaveChangesAsync(ct);
        }
        catch
        {
            await _blob.DeleteAsync(blobPath, ct);
            throw;
        }

        await InvalidateUserListCache(userId);
        return MapToDto(doc);
    }

    public async Task<ListDocumentsResponse> ListDocumentsAsync(Guid userId, int pageSize, string? cursor, string? status, string? tag, string? q, CancellationToken ct)
    {
        var cacheKeyParams = $"pageSize={pageSize}&cursor={cursor ?? ""}&status={status ?? ""}&tag={tag ?? ""}&q={q ?? ""}";
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(cacheKeyParams));
        var cacheKeySuffix = Convert.ToHexString(hash).ToLower();

        var ver = await _cache.GetAsync<long>($"user:{userId}:docs:list:ver");
        if (ver == 0) ver = 1;

        var fullCacheKey = $"user:{userId}:docs:list:v{ver}:{cacheKeySuffix}";
        var cached = await _cache.GetAsync<ListDocumentsResponse>(fullCacheKey);
        if (cached != null) return cached;

        var query = _db.Documents.Where(d => d.OwnerUserId == userId);

        if (!string.IsNullOrEmpty(status)) query = query.Where(d => d.Status == status);
        if (!string.IsNullOrEmpty(tag)) query = query.Where(d => EF.Functions.Like(d.TagsJson!, $"%\"{tag.ToLower()}\"%"));
        if (!string.IsNullOrEmpty(q)) query = query.Where(d => EF.Functions.Like(d.Title!, $"%{q}%") || EF.Functions.Like(d.OriginalFileName, $"%{q}%"));

        // Keyset Pagination
        if (!string.IsNullOrEmpty(cursor))
        {
            var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(cursor)).Split('|');
            var cursorTicks = long.Parse(decoded[0]);
            var cursorId = Guid.Parse(decoded[1]);
            var cursorTime = new DateTime(cursorTicks, DateTimeKind.Utc);

            query = query.Where(d => d.UploadedAtUtc < cursorTime || (d.UploadedAtUtc == cursorTime && d.DocumentId.CompareTo(cursorId) < 0));
        }

        var items = await query.OrderByDescending(d => d.UploadedAtUtc)
                              .ThenByDescending(d => d.DocumentId)
                              .Take(pageSize + 1)
                              .ToListAsync(ct);

        string? nextCursor = null;
        if (items.Count > pageSize)
        {
            var lastItem = items[pageSize - 1];
            nextCursor = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{lastItem.UploadedAtUtc.Ticks}|{lastItem.DocumentId}"));
            items = items.Take(pageSize).ToList();
        }

        var response = new ListDocumentsResponse(items.Select(MapToDto), nextCursor);
        await _cache.SetAsync(fullCacheKey, response, TimeSpan.FromSeconds(60));
        return response;
    }

    public async Task<DocumentDto> GetDocumentAsync(Guid userId, Guid documentId, CancellationToken ct)
    {
        var cacheKey = $"doc:{documentId}:meta";
        var cached = await _cache.GetAsync<DocumentDto>(cacheKey);
        if (cached != null && cached.OwnerUserId == userId) return cached;

        var doc = await _db.Documents.FirstOrDefaultAsync(d => d.DocumentId == documentId && d.OwnerUserId == userId, ct);
        if (doc == null) throw new KeyNotFoundException();

        var dto = MapToDto(doc);
        await _cache.SetAsync(cacheKey, dto, TimeSpan.FromSeconds(60));
        return dto;
    }

    public async Task<(Stream Stream, string FileName)> DownloadDocumentAsync(Guid userId, Guid documentId, CancellationToken ct)
    {
        var doc = await _db.Documents.FirstOrDefaultAsync(d => d.DocumentId == documentId && d.OwnerUserId == userId, ct);
        if (doc == null) throw new KeyNotFoundException();

        try { return (await _blob.DownloadAsync(doc.BlobPath, ct), doc.OriginalFileName); }
        catch (Exception) { throw new InvalidOperationException("blob_missing"); }
    }

    public async Task<DocumentDto> UpdateDocumentAsync(Guid userId, Guid documentId, UpdateDocumentRequest request, CancellationToken ct)
    {
        var doc = await _db.Documents.FirstOrDefaultAsync(d => d.DocumentId == documentId && d.OwnerUserId == userId, ct);
        if (doc == null) throw new KeyNotFoundException();

        if (request.Title != null) doc.Title = request.Title;
        if (request.Tags != null) doc.TagsJson = JsonSerializer.Serialize(NormalizeTags(request.Tags));

        await _db.SaveChangesAsync(ct);
        await InvalidateUserListCache(userId);
        await _cache.RemoveAsync($"doc:{documentId}:meta");

        return MapToDto(doc);
    }

    public async Task DeleteDocumentAsync(Guid userId, Guid documentId, CancellationToken ct)
    {
        var doc = await _db.Documents.FirstOrDefaultAsync(d => d.DocumentId == documentId && d.OwnerUserId == userId, ct);
        if (doc == null) throw new KeyNotFoundException();

        await _blob.DeleteAsync(doc.BlobPath, ct);
        _db.Documents.Remove(doc);
        await _db.SaveChangesAsync(ct);

        await InvalidateUserListCache(userId);
        await _cache.RemoveAsync($"doc:{documentId}:meta");
    }

    private string[] NormalizeTags(string[] tags) =>
        tags.Select(t => t.Trim().ToLower()).Where(t => !string.IsNullOrEmpty(t)).Distinct().Take(20).ToArray();

    private async Task InvalidateUserListCache(Guid userId) =>
        await _cache.IncrementAsync($"user:{userId}:docs:list:ver");

    private DocumentDto MapToDto(Document d) => new DocumentDto(
        d.DocumentId, d.OwnerUserId, d.OriginalFileName, d.Title,
        string.IsNullOrEmpty(d.TagsJson) ? Array.Empty<string>() : JsonSerializer.Deserialize<string[]>(d.TagsJson)!,
        d.SizeBytes, d.Sha256, d.Status, d.FailureReason, d.UploadedAtUtc, d.ProcessedAtUtc);
}