using System;

namespace LifeRpg.Backend.Services;

public class XpService
{
    public int CalculateXpRequired(int currentLevel)
    {
        // Formula: 100 * Level * 1.5
        return (int)Math.Floor(100 * currentLevel * 1.5);
    }
    
    // Additional logic for leveling up can go here
    public (bool LeveledUp, int NewLevel, int CurrentXp) AddXp(Models.Role role, int amount)
    {
        role.CurrentXp += amount;
        bool leveledUp = false;

        while (role.CurrentXp >= role.XpToNextLevel && role.Level < 100)
        {
            role.CurrentXp -= role.XpToNextLevel;
            role.Level++;
            role.XpToNextLevel = CalculateXpRequired(role.Level);
            leveledUp = true;
        }

        role.UpdatedAt = DateTime.UtcNow;
        return (leveledUp, role.Level, role.CurrentXp);
    }
}
