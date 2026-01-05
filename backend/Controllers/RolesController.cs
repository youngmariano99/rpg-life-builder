using LifeRpg.Backend.Data;
using LifeRpg.Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LifeRpg.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RolesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/roles?userId=...
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Role>>> GetRoles(Guid? userId)
    {
        if (userId == null)
        {
            // FIXME: In real app, extract from Token
            // userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            
            // For dev/test without auth, return BadRequest or all roles (risky)
            // Or just pick the first user from DB for testing purposes
            var firstUser = await _context.Users.FirstOrDefaultAsync();
            if (firstUser == null) return NotFound("No users found");
            userId = firstUser.Id;
        }

        var roles = await _context.Roles
            .Where(r => r.UserId == userId && r.IsActive)
            .Include(r => r.Quests.Where(q => q.Frequency == "daily" && !q.IsCompleted)) // Include daily active quests? simple include for now
            .ToListAsync();

        return Ok(roles);
    }

    // GET: api/roles/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Role>> GetRole(Guid id)
    {
        var role = await _context.Roles
            .Include(r => r.Skills)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null)
        {
            return NotFound();
        }

        return role;
    }

    // POST: api/roles
    [HttpPost]
    public async Task<ActionResult<Role>> CreateRole(Role role)
    {
        // Basic validation
        var count = await _context.Roles.CountAsync(r => r.UserId == role.UserId);
        if (count >= 7)
        {
            return BadRequest("Maximum 7 roles allowed per user.");
        }

        _context.Roles.Add(role);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRole), new { id = role.Id }, role);
    }
}
