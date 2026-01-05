using LifeRpg.Backend.Data;
using LifeRpg.Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeRpg.Backend.Controllers;

[ApiController]
[Route("api/time-blocks")]
public class TimeBlocksController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TimeBlocksController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/time-blocks
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TimeBlock>>> GetTimeBlocks(Guid? userId)
    {
        userId ??= await GetDefaultUserId();
        if (userId == null) return NotFound("User not found");

        return await _context.TimeBlocks
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.StartTime)
            .ToListAsync();
    }

    // GET: api/time-blocks/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<TimeBlock>> GetTimeBlock(Guid id)
    {
        var timeBlock = await _context.TimeBlocks.FindAsync(id);
        if (timeBlock == null) return NotFound();
        return timeBlock;
    }

    // POST: api/time-blocks
    [HttpPost]
    public async Task<ActionResult<TimeBlock>> CreateTimeBlock(TimeBlock timeBlock)
    {
        if (timeBlock.UserId == Guid.Empty)
        {
             var userId = await GetDefaultUserId();
             if (userId == null) return BadRequest("User ID required");
             timeBlock.UserId = userId.Value;
        }

        timeBlock.CreatedAt = DateTime.UtcNow;
        _context.TimeBlocks.Add(timeBlock);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTimeBlock), new { id = timeBlock.Id }, timeBlock);
    }

    // PUT: api/time-blocks/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTimeBlock(Guid id, TimeBlock timeBlock)
    {
        if (id != timeBlock.Id) return BadRequest();

        _context.Entry(timeBlock).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.TimeBlocks.Any(e => e.Id == id)) return NotFound();
            throw;
        }

        return Ok(timeBlock);
    }

    // DELETE: api/time-blocks/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTimeBlock(Guid id)
    {
        var timeBlock = await _context.TimeBlocks.FindAsync(id);
        if (timeBlock == null) return NotFound();

        _context.TimeBlocks.Remove(timeBlock);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<Guid?> GetDefaultUserId()
    {
        var user = await _context.Users.FirstOrDefaultAsync();
        return user?.Id;
    }
}
