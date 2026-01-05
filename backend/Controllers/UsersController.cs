using LifeRpg.Backend.Data;
using LifeRpg.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using LifeRpg.Backend.DTOs;

namespace LifeRpg.Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    public async Task<ActionResult<LifeRpg.Backend.Models.User>> GetMe()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var user = await _context.Users.FindAsync(Guid.Parse(userId));
        if (user == null) return NotFound();

        return Ok(user);
    }

    [HttpGet("me/stats")]
    [Authorize] // ¡Importante! Solo usuarios logueados
    public async Task<ActionResult<DashboardStatsDto>> GetMyStats()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        
        // 1. Obtener Usuario para Nivel y XP
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        // 2. Calcular XP para el siguiente nivel (Fórmula: 100 * Nivel * 1.5)
        // Nota: Idealmente mover esta fórmula a XpService para reutilizarla
        var xpNeededForNext = (int)(100 * user.Level * 1.5);

        // 3. Calcular Racha Global (Días consecutivos con registros en XpLogs)
        // Buscamos fechas únicas donde hubo actividad en los últimos 365 días
        var activityDates = await _context.XpLogs
            .Where(x => x.UserId == userId && x.CreatedAt >= DateTime.UtcNow.AddDays(-365))
            .Select(x => x.CreatedAt.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToListAsync();

        int streak = 0;
        var checkDate = DateTime.UtcNow.Date;
        
        // Si hoy no hay actividad, chequeamos si la racha terminó ayer
        if (!activityDates.Contains(checkDate))
        {
            // Si hay actividad ayer, la racha sigue viva (pero hoy no has hecho nada aún)
            if (activityDates.Contains(checkDate.AddDays(-1)))
                checkDate = checkDate.AddDays(-1);
            else
                checkDate = DateTime.MinValue; // Racha rota
        }

        if (checkDate != DateTime.MinValue)
        {
            foreach (var date in activityDates)
            {
                if (date == checkDate)
                {
                    streak++;
                    checkDate = checkDate.AddDays(-1);
                }
                else if (date < checkDate) break; // Hueco en la racha
            }
        }

        // 4. Calcular Horas Enfocadas de Hoy
        // Sumamos la duración de los TimeBlocks tipo 'focus' que tocan hoy (por día de semana)
        var todayDayOfWeek = (int)DateTime.UtcNow.DayOfWeek; // 0 = Domingo, 1 = Lunes...
        
        var focusBlocks = await _context.TimeBlocks
            .Where(t => t.UserId == userId 
                        && t.BlockType == "focus" 
                        && t.DaysOfWeek.Contains(todayDayOfWeek))
            .ToListAsync();

        double focusHours = 0;
        foreach (var block in focusBlocks)
        {
            // Asumiendo que start_time y end_time son TimeSpan o DateTime
            // Si son TimeSpan:
            focusHours += (block.EndTime - block.StartTime).TotalHours;
        }

        return new DashboardStatsDto
        {
            Level = user.Level,
            CurrentXp = user.TotalXp, // Ojo: ¿Usas TotalXP o CurrentXP del nivel? Ajusta según tu lógica
            XpToNextLevel = xpNeededForNext,
            GlobalStreak = streak,
            FocusHoursToday = Math.Round(focusHours, 1)
        };
    }
}
