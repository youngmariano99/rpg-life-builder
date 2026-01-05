using System.ComponentModel.DataAnnotations;

namespace LifeRpg.Backend.DTOs;

public record LoginDto(
    [Required] [EmailAddress] string Email,
    [Required] string Password
);

public record RegisterDto(
    [Required] [EmailAddress] string Email,
    [Required] string Username,
    [Required] string Password
);

public record AuthResponseDto(
    string Token,
    Guid UserId,
    string Username,
    string Email
);
