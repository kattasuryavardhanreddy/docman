namespace DocMan.Core.DTOs;

public record ErrorEnvelope(
    string Code,
    string Message,
    object? Details,
    string TraceId
);

public record ErrorResponse(ErrorEnvelope Error);