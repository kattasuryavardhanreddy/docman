using DocMan.Core.DTOs;
using DocMan.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;

namespace DocMan.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/documents")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _docService;
    public DocumentsController(IDocumentService docService) => _docService = docService;

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> Upload(IFormFile file, [FromForm] string? metadata, CancellationToken ct)
    {
        if (file == null || file.Length == 0) return ValidationErr("file", "File is required");
        if (file.Length > 25 * 1024 * 1024) return StatusCode(413, Error("payload_too_large", "Max size 25MB"));
        if (file.ContentType != "application/pdf") return StatusCode(415, Error("unsupported_media_type", "Only PDFs allowed"));

        using var stream = file.OpenReadStream();
        byte[] buffer = new byte[5];
        await stream.ReadAsync(buffer, 0, 5, ct);
        if (System.Text.Encoding.UTF8.GetString(buffer) != "%PDF-") return StatusCode(415, Error("unsupported_media_type", "Invalid PDF signature"));
        stream.Position = 0;

        UploadMetadata? meta = null;
        if (!string.IsNullOrEmpty(metadata)) meta = JsonSerializer.Deserialize<UploadMetadata>(metadata, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        if (meta?.Title?.Length > 200) return ValidationErr("title", "Max length 200");
        if (meta?.Tags?.Any(t => t.Length > 50) == true) return ValidationErr("tags", "Tag max length 50");

        var doc = await _docService.CreateDocumentAsync(UserId, file.FileName, stream, meta, ct);
        return Created($"/api/v1/documents/{doc.DocumentId}", doc);
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int pageSize = 25, [FromQuery] string? cursor = null, [FromQuery] string? status = null, [FromQuery] string? tag = null, [FromQuery] string? q = null, CancellationToken ct = default)
    {
        pageSize = Math.Min(pageSize, 100);
        return Ok(await _docService.ListDocumentsAsync(UserId, pageSize, cursor, status, tag, q, ct));
    }

    [HttpGet("{documentId}")]
    public async Task<IActionResult> Get(Guid documentId, CancellationToken ct)
    {
        try { return Ok(await _docService.GetDocumentAsync(UserId, documentId, ct)); }
        catch (KeyNotFoundException) { return NotFound(Error("not_found", "Document not found")); }
    }

    [HttpGet("{documentId}/download")]
    public async Task<IActionResult> Download(Guid documentId, CancellationToken ct)
    {
        try
        {
            var (stream, fileName) = await _docService.DownloadDocumentAsync(UserId, documentId, ct);
            return File(stream, "application/pdf", fileName);
        }
        catch (KeyNotFoundException) { return NotFound(Error("not_found", "Document not found")); }
        catch (InvalidOperationException ex) when (ex.Message == "blob_missing")
        {
            return StatusCode(500, Error("internal_error", "Blob missing", new { reason = "blob_missing" }));
        }
    }

    [HttpPatch("{documentId}")]
    public async Task<IActionResult> Update(Guid documentId, [FromBody] UpdateDocumentRequest req, CancellationToken ct)
    {
        if (req.Title == null && req.Tags == null) return ValidationErr("payload", "Provide title or tags");
        if (req.Title?.Length > 200) return ValidationErr("title", "Max length 200");

        try { return Ok(await _docService.UpdateDocumentAsync(UserId, documentId, req, ct)); }
        catch (KeyNotFoundException) { return NotFound(Error("not_found", "Document not found")); }
    }

    [HttpDelete("{documentId}")]
    public async Task<IActionResult> Delete(Guid documentId, CancellationToken ct)
    {
        try { await _docService.DeleteDocumentAsync(UserId, documentId, ct); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(Error("not_found", "Document not found")); }
    }

    private ErrorResponse Error(string code, string msg, object? details = null) => new(new ErrorEnvelope(code, msg, details, HttpContext.TraceIdentifier));
    private IActionResult ValidationErr(string field, string msg) => BadRequest(new ErrorResponse(new ErrorEnvelope("validation_failed", "Validation failed", new { errors = new Dictionary<string, string[]> { { field, new[] { msg } } } }, HttpContext.TraceIdentifier)));
}