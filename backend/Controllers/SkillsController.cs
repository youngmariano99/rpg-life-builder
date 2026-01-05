using LifeRpg.Backend.Data;
using LifeRpg.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LifeRpg.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // 1. ¡Seguridad Primero! Solo usuarios con Token
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
        // 2. Identificar al usuario real
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        // 3. Consulta Segura:
        // Buscamos skills donde el Rol asociado pertenezca a ESTE usuario.
        // Esto evita que veas skills de otros, incluso si tienes sus IDs.
        var query = _context.Skills
            .Include(s => s.Role) // Necesitamos el Rol para ver el UserId
            .Where(s => s.Role.UserId == userId);

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
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        var skill = await _context.Skills
            .Include(s => s.Role)
            .FirstOrDefaultAsync(s => s.Id == id && s.Role.UserId == userId); // Validación de dueño

        if (skill == null) return NotFound();
        return skill;
    }

    // POST: api/skills
    [HttpPost]
    public async Task<ActionResult<Skill>> CreateSkill(Skill skill)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        // Verificar que el Rol al que queremos agregar la skill nos pertenece
        var role = await _context.Roles.FindAsync(skill.RoleId);
        if (role == null || role.UserId != userId)
        {
            return BadRequest("El rol no existe o no te pertenece.");
        }

        // Defaults
        skill.IsUnlocked = false;
        
        // Si no tiene padre, es una habilidad raíz y debería estar disponible (visible)
        if (skill.ParentSkillId == null)
        {
            skill.IsAvailable = true;
        }
        else
        {
            // Si tiene padre, nace no disponible hasta que se desbloquee el padre
            skill.IsAvailable = false;
        }

        _context.Skills.Add(skill);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetSkill", new { id = skill.Id }, skill);
    }

    // POST: api/skills/{id}/unlock
    [HttpPost("{id}/unlock")]
    public async Task<IActionResult> UnlockSkill(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        var skill = await _context.Skills
            .Include(s => s.Role)
            .FirstOrDefaultAsync(s => s.Id == id && s.Role.UserId == userId);

        if (skill == null) return NotFound("Habilidad no encontrada o sin permiso.");

        if (skill.IsUnlocked) return BadRequest("Ya está desbloqueada.");
        if (!skill.IsAvailable) return BadRequest("Aún no está disponible (desbloquea la anterior primero).");

        // Lógica de desbloqueo
        skill.IsUnlocked = true;
        
        // Hacer disponibles a los hijos
        var childSkills = await _context.Skills
            .Where(s => s.ParentSkillId == id)
            .ToListAsync();

        foreach (var child in childSkills)
        {
            child.IsAvailable = true;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Habilidad desbloqueada", skill });
    }
}