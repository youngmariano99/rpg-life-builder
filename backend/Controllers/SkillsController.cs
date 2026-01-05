using LifeRpg.Backend.Data;
using LifeRpg.Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeRpg.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SkillsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SkillsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/skills?roleId=...
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Skill>>> GetSkills(Guid? roleId)
    {
        var query = _context.Skills.AsQueryable();

        if (roleId.HasValue)
        {
            query = query.Where(s => s.RoleId == roleId);
        }

        return await query.ToListAsync();
    }

    // GET: api/skills/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Skill>> GetSkill(Guid id)
    {
        var skill = await _context.Skills.FindAsync(id);
        if (skill == null) return NotFound();
        return skill;
    }

    // POST: api/skills
    [HttpPost]
    public async Task<ActionResult<Skill>> CreateSkill(Skill skill)
    {
        // Defaults
        skill.IsUnlocked = false;
        // Available if no parent, or check parent later (but typically new skills are locked unless root)
        skill.IsAvailable = !skill.ParentSkillId.HasValue; 
        skill.CreatedAt = DateTime.UtcNow;

        _context.Skills.Add(skill);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSkill), new { id = skill.Id }, skill);
    }

    // PUT: api/skills/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSkill(Guid id, Skill skill)
    {
        if (id != skill.Id) return BadRequest();

        _context.Entry(skill).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Skills.Any(e => e.Id == id)) return NotFound();
            throw;
        }

        return Ok(skill);
    }

    // DELETE: api/skills/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSkill(Guid id)
    {
        var skill = await _context.Skills.FindAsync(id);
        if (skill == null) return NotFound();

        _context.Skills.Remove(skill);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/skills/{id}/unlock
    [HttpPost("{id}/unlock")]
    public async Task<IActionResult> UnlockSkill(Guid id)
    {
        var skill = await _context.Skills.FindAsync(id);
        if (skill == null) return NotFound("Skill not found");

        if (skill.IsUnlocked) return BadRequest("Skill already unlocked");
        if (!skill.IsAvailable) return BadRequest("Skill not available yet");

        // Here we could add logic to deduct XP or Money from User/Role if CostXp > 0
        // For now, simple unlock logic as per frontend mock

        skill.IsUnlocked = true;
        
        // Make children available
        var childSkills = await _context.Skills
            .Where(s => s.ParentSkillId == id)
            .ToListAsync();

        foreach (var child in childSkills)
        {
            child.IsAvailable = true;
        }

        await _context.SaveChangesAsync();

        return Ok(new 
        { 
            skill, 
            success = true, 
            message = "Skill unlocked!" 
        });
    }
}
