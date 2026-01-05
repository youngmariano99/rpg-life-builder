using LifeRpg.Backend.Data;
using LifeRpg.Backend.DTOs;
using LifeRpg.Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeRpg.Backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ApplicationDbContext _context; // To fetch user details manually if needed

    public AuthController(AuthService authService, ApplicationDbContext context)
    {
        _authService = authService;
        _context = context;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        var user = await _authService.Register(dto.Email, dto.Username, dto.Password);
        if (user == null)
            return BadRequest("User already exists");

        var token = await _authService.Login(dto.Email, dto.Password);
        
        return Ok(new AuthResponseDto(token!, user.Id, user.Username, user.Email));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var token = await _authService.Login(dto.Email, dto.Password);
        if (token == null)
            return Unauthorized("Invalid credentials");

        var user = await _context.Users.FirstAsync(u => u.Email == dto.Email);
        
        return Ok(new AuthResponseDto(token, user.Id, user.Username, user.Email));
    }
}
