using LifeRpg.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace LifeRpg.Backend.Data;

public static class DbInitializer
{
    public static void Initialize(ApplicationDbContext context)
    {
        // Ensure database is created
        // context.Database.EnsureCreated(); // Or rely on manual schema.sql

        // Look for any users.
        if (context.Users.Any())
        {
            return;   // DB has been seeded
        }

        // Create default user
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("password123");
        
        var user = new User
        {
            Email = "heroe@liferpg.com",
            Username = "Heroe",
            PasswordHash = passwordHash,
            Level = 1,
            TotalXp = 0,
            Mission = "Convertirme en la mejor versión de mí mismo",
            Vision = "Ser un referente de productividad y balance",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Users.Add(user);
        context.SaveChanges();
        
        // Add a default Role
        var role = new Role
        {
            UserId = user.Id,
            Name = "Aventurero Novato",
            Description = "Tu primer rol en este mundo",
            Icon = "User",
            Color = "bg-blue-500",
            Level = 1,
            CreatedAt = DateTime.UtcNow
        };
        
        context.Roles.Add(role);
        context.SaveChanges();
    }
}
