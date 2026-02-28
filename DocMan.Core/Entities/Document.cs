using System;
using System.ComponentModel.DataAnnotations;

namespace DocMan.Core.Entities;

public class Document
{
    public Guid DocumentId { get; set; }
    public Guid OwnerUserId { get; set; }

    [Required, MaxLength(512)]
    public string OriginalFileName { get; set; } = null!;

    [MaxLength(200)]
    public string? Title { get; set; }

    public string? TagsJson { get; set; }

    [Required, MaxLength(512)]
    public string BlobPath { get; set; } = null!;

    public long SizeBytes { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Uploaded"; // Uploaded, Processing, Processed, Failed

    [MaxLength(512)]
    public string? FailureReason { get; set; }

    public DateTime UploadedAtUtc { get; set; }
    public DateTime? ProcessedAtUtc { get; set; }
    public DateTime? ProcessingStartedAtUtc { get; set; } // Added for Phase 3

    [MaxLength(64)]
    public string? Sha256 { get; set; }

    public User Owner { get; set; } = null!;
}