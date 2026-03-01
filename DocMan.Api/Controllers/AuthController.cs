using System;
using System.Security.Claims;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using DocMan.Core.DTOs;
using DocMan.Core.Entities;
using DocMan.Infrastructure.Data;
using DocMan.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DocMan.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<User> _hasher;
    private readonly IJwtService _jwtService;

    public AuthController(AppDbContext context, IPasswordHasher<User> hasher, IJwtService jwtService)
    {
        _context = context;
        _hasher = hasher;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var normalized = request.Email.Trim().ToUpperInvariant();

        if (await _context.Users.AnyAsync(u => u.NormalizedEmail == normalized))
        {
            return Conflict(new ErrorResponse(new ErrorEnvelope(
                "conflict", "Email already exists", null, HttpContext.TraceIdentifier)));
        }

        var user = new User
        {
            UserId = Guid.NewGuid(),
            Email = request.Email,
            NormalizedEmail = normalized,
            CreatedAtUtc = DateTime.UtcNow
        };
        user.PasswordHash = _hasher.HashPassword(user, request.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Created("", new AuthResponse(
            new UserDto(user.UserId, user.Email, user.CreatedAtUtc),
            _jwtService.GenerateToken(user),
            3600
        ));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var normalized = request.Email.Trim().ToUpperInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalized);

        if (user == null || _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new ErrorResponse(new ErrorEnvelope(
                "unauthorized", "Invalid credentials", null, HttpContext.TraceIdentifier)));
        }

        return Ok(new AuthResponse(
            new UserDto(user.UserId, user.Email, user.CreatedAtUtc),
            _jwtService.GenerateToken(user),
            3600
        ));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        // Use ClaimTypes.NameIdentifier instead of JwtRegisteredClaimNames.Sub
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(sub, out var userId)) 
            return Unauthorized(new ErrorResponse(new ErrorEnvelope("unauthorized", "Invalid token", null, HttpContext.TraceIdentifier)));

        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserId == userId);
        if (user == null)
            return Unauthorized(new ErrorResponse(new ErrorEnvelope("unauthorized", "User not found", null, HttpContext.TraceIdentifier)));

        return Ok(new MeResponse(user.UserId, user.Email, user.CreatedAtUtc));
    }
}