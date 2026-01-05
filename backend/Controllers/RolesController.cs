using LifeRpg.Backend.Data;
using LifeRpg.Backend.Models;
using Microsoft.AspNetCore.Authorization;
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
    // GET: api/roles
    [HttpGet]
    [Authorize] // <--- ¡Importante! Aseguramos que venga con Token
    public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
    {
        // 1. Extraer ID del Token (Igual que hicimos en el Create)
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        var userId = Guid.Parse(userIdClaim.Value);

        // 2. Buscar SOLO los roles de este usuario
        var roles = await _context.Roles
            .Where(r => r.UserId == userId && r.IsActive)
            .Include(r => r.Quests.Where(q => q.Frequency == "daily" && !q.IsCompleted))
            .Include(r => r.Skills) // <--- Agregué esto por si acaso quieres ver skills en el dashboard
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
    [Authorize] // Confirmamos que solo usuarios logueados entren
    public async Task<ActionResult<Role>> CreateRole(Role role)
    {
        // 1. Obtener el ID real del usuario desde el Token (Claims)
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            return Unauthorized("No se pudo identificar al usuario.");
        }

        // 2. Sobrescribir el UserId del objeto con el del token
        // Esto evita que alguien cree roles para otros usuarios
        role.UserId = Guid.Parse(userIdClaim.Value);

        // 3. Validaciones adicionales (opcional)
        // Por ejemplo, verificar que no tenga ya 7 roles
        var rolesCount = await _context.Roles.CountAsync(r => r.UserId == role.UserId);
        if (rolesCount >= 7)
        {
            return BadRequest("Has alcanzado el límite de 7 clases.");
        }

        _context.Roles.Add(role);
        try 
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            // Log del error para debugging si vuelve a pasar
            return BadRequest($"Error al guardar: {ex.InnerException?.Message ?? ex.Message}");
        }

        return CreatedAtAction("GetRole", new { id = role.Id }, role);
    }
}
