using System;

namespace DocMan.Core.DTOs;

public record UserDto(
    Guid UserId,
    string Email,
    DateTime CreatedAt
);

public record AuthResponse(
    UserDto User,
    string AccessToken,
    int ExpiresInSeconds
);

public record MeResponse(
    Guid UserId,
    string Email,
    DateTime CreatedAt
);