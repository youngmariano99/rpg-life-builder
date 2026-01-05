using LifeRpg.Backend.Data;
using LifeRpg.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LifeRpg.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Solo usuarios logueados
public class InvestmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public InvestmentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/investments
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Investment>>> GetInvestments()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        var investments = await _context.Investments
            .Where(i => i.UserId == userId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return Ok(investments);
    }

    // POST: api/investments
    [HttpPost]
    public async Task<ActionResult<Investment>> CreateInvestment(Investment investment)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        // Asignar al usuario actual
        investment.UserId = userId;
        
        // Validar status por defecto si viene vacío
        if (string.IsNullOrEmpty(investment.Status)) investment.Status = "planned";

        _context.Investments.Add(investment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetInvestments), new { id = investment.Id }, investment);
    }

    // DELETE: api/investments/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInvestment(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        var investment = await _context.Investments
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (investment == null) return NotFound();

        _context.Investments.Remove(investment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}