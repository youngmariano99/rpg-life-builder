using LifeRpg.Backend.Data;
using LifeRpg.Backend.Models;
using LifeRpg.Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeRpg.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ObjectivesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly XpService _xpService;

    public ObjectivesController(ApplicationDbContext context, XpService xpService)
    {
        _context = context;
        _xpService = xpService;
    }

    // GET: api/objectives
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Objective>>> GetObjectives(Guid? userId, string? quarter, int? year)
    {
        userId ??= await GetDefaultUserId();
        if (userId == null) return NotFound("User not found");

        var query = _context.Objectives.Where(o => o.UserId == userId);

        if (!string.IsNullOrEmpty(quarter))
            query = query.Where(o => o.Quarter == quarter);
        
        if (year.HasValue)
            query = query.Where(o => o.Year == year);

        return await query.ToListAsync();
    }

    // GET: api/objectives/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Objective>> GetObjective(Guid id)
    {
        var objective = await _context.Objectives.FindAsync(id);
        if (objective == null) return NotFound();
        return objective;
    }

    // POST: api/objectives
    [HttpPost]
    public async Task<ActionResult<Objective>> CreateObjective(Objective objective)
    {
        if (objective.UserId == Guid.Empty)
        {
             var userId = await GetDefaultUserId();
             if (userId == null) return BadRequest("User ID required");
             objective.UserId = userId.Value;
        }

        objective.Status = "pending";
        objective.CreatedAt = DateTime.UtcNow;
        objective.UpdatedAt = DateTime.UtcNow;

        _context.Objectives.Add(objective);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetObjective), new { id = objective.Id }, objective);
    }

    // PUT: api/objectives/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateObjective(Guid id, Objective objective)
    {
        if (id != objective.Id) return BadRequest();

        objective.UpdatedAt = DateTime.UtcNow;
        _context.Entry(objective).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Objectives.Any(e => e.Id == id)) return NotFound();
            throw;
        }

        return Ok(objective);
    }

    // DELETE: api/objectives/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteObjective(Guid id)
    {
        var objective = await _context.Objectives.FindAsync(id);
        if (objective == null) return NotFound();

        _context.Objectives.Remove(objective);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/objectives/{id}/complete
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteObjective(Guid id)
    {
        var objective = await _context.Objectives.FindAsync(id);
        if (objective == null) return NotFound();

        if (objective.Status == "completed") return BadRequest("Already completed");

        objective.Status = "completed";
        objective.CompletedAt = DateTime.UtcNow;
        objective.UpdatedAt = DateTime.UtcNow;

        // If objective has a RoleId, award XP
        if (objective.RoleId.HasValue)
        {
            var role = await _context.Roles.FindAsync(objective.RoleId);
            if (role != null)
            {
                _xpService.AddXp(role, objective.XpReward);
                
                // Track XP Log
                 var xpLog = new XpLog
                {
                    UserId = objective.UserId,
                    RoleId = objective.RoleId.Value,
                    SourceType = "objective",
                    SourceId = objective.Id,
                    XpAmount = objective.XpReward,
                    CreatedAt = DateTime.UtcNow
                };
                _context.XpLogs.Add(xpLog);
            }
        }

        await _context.SaveChangesAsync();
        return Ok(objective);
    }

    private async Task<Guid?> GetDefaultUserId()
    {
        var user = await _context.Users.FirstOrDefaultAsync();
        return user?.Id;
    }
}
