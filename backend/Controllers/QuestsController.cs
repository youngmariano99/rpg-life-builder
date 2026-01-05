using LifeRpg.Backend.Data;
using LifeRpg.Backend.Models;
using LifeRpg.Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeRpg.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly XpService _xpService;

    public QuestsController(ApplicationDbContext context, XpService xpService)
    {
        _context = context;
        _xpService = xpService;
    }

    // GET: api/quests?userId=...
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Quest>>> GetQuests(Guid? userId, Guid? roleId)
    {
        userId ??= await GetDefaultUserId();
        if (userId == null) return NotFound("User not found");

        var query = _context.Quests.Where(q => q.UserId == userId);

        if (roleId.HasValue)
        {
            query = query.Where(q => q.RoleId == roleId);
        }

        return await query.ToListAsync();
    }

    // GET: api/quests/today
    [HttpGet("today")]
    public async Task<ActionResult<IEnumerable<Quest>>> GetTodayQuests(Guid? userId)
    {
        userId ??= await GetDefaultUserId();
        if (userId == null) return NotFound("User not found");

        // Filter for daily quests or weekly/monthly active
        // This logic mimics the frontend: anything that is 'daily' or 'weekly'
        return await _context.Quests
            .Where(q => q.UserId == userId && (q.Frequency == "daily" || q.Frequency == "weekly"))
            .ToListAsync();
    }

    // GET: api/quests/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Quest>> GetQuest(Guid id)
    {
        var quest = await _context.Quests.FindAsync(id);
        if (quest == null) return NotFound();
        return quest;
    }

    // POST: api/quests
    [HttpPost]
    public async Task<ActionResult<Quest>> CreateQuest(Quest quest)
    {
        // Set defaults
        quest.IsCompleted = false;
        quest.Streak = 0;
        quest.CreatedAt = DateTime.UtcNow;
        quest.UpdatedAt = DateTime.UtcNow;

        // Ensure valid user/role
        if (quest.UserId == Guid.Empty)
        {
             var userId = await GetDefaultUserId();
             if (userId == null) return BadRequest("User ID required");
             quest.UserId = userId.Value;
        }

        _context.Quests.Add(quest);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetQuest), new { id = quest.Id }, quest);
    }

    // PUT: api/quests/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateQuest(Guid id, Quest quest)
    {
        if (id != quest.Id) return BadRequest();

        quest.UpdatedAt = DateTime.UtcNow;
        _context.Entry(quest).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Quests.Any(e => e.Id == id)) return NotFound();
            throw;
        }

        return Ok(quest);
    }

    // DELETE: api/quests/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteQuest(Guid id)
    {
        var quest = await _context.Quests.FindAsync(id);
        if (quest == null) return NotFound();

        _context.Quests.Remove(quest);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/quests/{id}/complete
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteQuest(Guid id)
    {
        var quest = await _context.Quests.FindAsync(id);
        if (quest == null) return NotFound("Quest not found");

        if (quest.IsCompleted) return BadRequest("Quest already completed");

        // 1. Mark as completed
        quest.IsCompleted = true;
        quest.CompletedAt = DateTime.UtcNow;
        quest.Streak++;
        quest.UpdatedAt = DateTime.UtcNow;

        // 2. Add XP to Role
        var role = await _context.Roles.FindAsync(quest.RoleId);
        if (role == null) return NotFound("Role not found");

        var checkLevel = _xpService.AddXp(role, quest.XpReward);

        // 3. Log the completion
        var log = new QuestLog
        {
            QuestId = quest.Id,
            UserId = quest.UserId,
            CompletedAt = DateTime.UtcNow,
            XpEarned = quest.XpReward
        };
        _context.QuestLogs.Add(log);
        
        // 4. Log XP source
        var xpLog = new XpLog
        {
            UserId = quest.UserId,
            RoleId = quest.RoleId,
            SourceType = "quest",
            SourceId = quest.Id,
            XpAmount = quest.XpReward,
            CreatedAt = DateTime.UtcNow
        };
        _context.XpLogs.Add(xpLog);

        await _context.SaveChangesAsync();

        return Ok(new 
        { 
            quest, 
            xpEarned = quest.XpReward, 
            leveledUp = checkLevel.LeveledUp,
            role
        });
    }

    // POST: api/quests/{id}/uncomplete
    [HttpPost("{id}/uncomplete")]
    public async Task<IActionResult> UncompleteQuest(Guid id)
    {
        var quest = await _context.Quests.FindAsync(id);
        if (quest == null) return NotFound();

        quest.IsCompleted = false;
        quest.CompletedAt = null;
        // Streak logic on uncomplete is tricky, usually we simply don't revert streak to avoid complex history tracking issues
        // or strictly checking log. For now, keep streak or decrement? 
        // Frontend mock didn't decrement streak explicitly in uncompleteQuest, so let's check.
        // It just set is_completed false.
        
        quest.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(quest);
    }

    // POST: api/quests/reset-daily
    [HttpPost("reset-daily")]
    public async Task<IActionResult> ResetDailyQuests()
    {
        var userId = await GetDefaultUserId();
        if (userId == null) return NotFound();

        var dailyQuests = await _context.Quests
            .Where(q => q.UserId == userId && q.Frequency == "daily" && q.IsCompleted)
            .ToListAsync();

        foreach (var q in dailyQuests)
        {
            q.IsCompleted = false;
            q.CompletedAt = null;
            q.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    private async Task<Guid?> GetDefaultUserId()
    {
        // For Development: Pick first user
        var user = await _context.Users.FirstOrDefaultAsync();
        return user?.Id;
    }
}
