// backend/DTOs/DashboardDtos.cs
namespace LifeRpg.Backend.DTOs;

public class DashboardStatsDto
{
    public int Level { get; set; }
    public int CurrentXp { get; set; }
    public int XpToNextLevel { get; set; } // Calculado
    public int GlobalStreak { get; set; }  // Racha de días seguidos ganando XP
    public double FocusHoursToday { get; set; } // Suma de bloques de 'focus' de hoy
}