using System.ComponentModel.DataAnnotations;

namespace DocMan.Core.Entities;

public class User
{
    public Guid UserId { get; set; }
    [Required, MaxLength(254)]
    public string Email { get; set; } = null!;
    [Required, MaxLength(254)]
    public string NormalizedEmail { get; set; } = null!;
    [Required]
    public string PasswordHash { get; set; } = null!;
    public DateTime CreatedAtUtc { get; set; }
}