using System;
using System.Collections.Generic;

namespace DocMan.Core.DTOs;

public record DocumentDto(
    Guid DocumentId,
    Guid OwnerUserId,
    string OriginalFileName,
    string? Title,
    string[] Tags,
    long SizeBytes,
    string? Sha256,
    string Status,
    string? FailureReason,
    DateTime UploadedAt,
    DateTime? ProcessedAt
);

public record ListDocumentsResponse(
    IEnumerable<DocumentDto> Items,
    string? NextCursor
);

public record UpdateDocumentRequest(
    string? Title,
    string[]? Tags
);

public record UploadMetadata(
    string? Title,
    string[]? Tags
);