using DocMan.Core.DTOs;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace DocMan.Infrastructure.Services;

public interface IDocumentService
{
    Task<DocumentDto> CreateDocumentAsync(Guid userId, string fileName, Stream content, UploadMetadata? meta, CancellationToken ct);
    Task<ListDocumentsResponse> ListDocumentsAsync(Guid userId, int pageSize, string? cursor, string? status, string? tag, string? q, CancellationToken ct);
    Task<DocumentDto> GetDocumentAsync(Guid userId, Guid documentId, CancellationToken ct);
    Task<(Stream Stream, string FileName)> DownloadDocumentAsync(Guid userId, Guid documentId, CancellationToken ct);
    Task<DocumentDto> UpdateDocumentAsync(Guid userId, Guid documentId, UpdateDocumentRequest request, CancellationToken ct);
    Task DeleteDocumentAsync(Guid userId, Guid documentId, CancellationToken ct);
}