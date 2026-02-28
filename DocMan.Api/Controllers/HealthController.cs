using DocMan.Core.DTOs;
using DocMan.Infrastructure.Data;
using DocMan.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace DocMan.Api.Controllers;

[ApiController]
[Route("api/v1/health")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ICacheService _cache;
    private readonly IBlobStorageService _blob;

    public HealthController(AppDbContext context, ICacheService cache, IBlobStorageService blob)
    {
        _context = context;
        _cache = cache;
        _blob = blob;
    }

    [HttpGet("live")]
    public IActionResult Live() => Ok(new { status = "ok" });

    [HttpGet("ready")]
    public async Task<IActionResult> Ready()
    {
        var sqlOk = await _context.Database.CanConnectAsync();
        if (!sqlOk) return DependencyError("sql");

        var redisOk = await _cache.IsReadyAsync();
        if (!redisOk) return DependencyError("redis");

        var blobOk = await _blob.IsReadyAsync();
        if (!blobOk) return DependencyError("blob");

        return Ok(new
        {
            status = "ok",
            dependencies = new { sql = "ok", redis = "ok", blob = "ok" }
        });
    }

    private IActionResult DependencyError(string dep) => StatusCode(503, new ErrorResponse(new ErrorEnvelope(
        "dependency_unavailable", "Dependency unavailable", new { dependency = dep }, HttpContext.TraceIdentifier)));
}