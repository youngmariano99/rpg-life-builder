using LifeRpg.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace LifeRpg.Backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Quest> Quests { get; set; }
    public DbSet<QuestLog> QuestLogs { get; set; }
    public DbSet<Skill> Skills { get; set; }
    public DbSet<Objective> Objectives { get; set; }
    public DbSet<TimeBlock> TimeBlocks { get; set; }
    public DbSet<Campaign> Campaigns { get; set; }
    public DbSet<Investment> Investments { get; set; }
    public DbSet<XpLog> XpLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Enable UUID extension
        modelBuilder.HasPostgresExtension("uuid-ossp");

        // User
        modelBuilder.Entity<User>()
            .Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()");
        
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
        
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        // Role
        modelBuilder.Entity<Role>()
            .Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()");

        modelBuilder.Entity<Role>()
            .HasOne(r => r.User)
            .WithMany(u => u.Roles)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Quest
        modelBuilder.Entity<Quest>()
            .Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()");

        modelBuilder.Entity<Quest>()
            .HasOne(q => q.Role)
            .WithMany(r => r.Quests)
            .HasForeignKey(q => q.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<Quest>()
             .HasOne(q => q.User)
             .WithMany(u => u.Quests)
             .HasForeignKey(q => q.UserId)
             .OnDelete(DeleteBehavior.Cascade);

        // QuestLog
        modelBuilder.Entity<QuestLog>()
            .Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()");

        // Skill
        modelBuilder.Entity<Skill>()
            .Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()");

        modelBuilder.Entity<Skill>()
            .HasOne(s => s.Role)
            .WithMany(r => r.Skills)
            .HasForeignKey(s => s.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Skill>()
            .HasOne(s => s.ParentSkill)
            .WithMany(p => p.ChildSkills)
            .HasForeignKey(s => s.ParentSkillId)
            .OnDelete(DeleteBehavior.SetNull);

        // Objective
        modelBuilder.Entity<Objective>()
            .Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()");

        // TimeBlock
        modelBuilder.Entity<TimeBlock>()
            .Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()");

        // Campaign
        modelBuilder.Entity<Campaign>()
            .Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()");

        // Investment
        modelBuilder.Entity<Investment>()
            .Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()");

        // XpLog
        modelBuilder.Entity<XpLog>()
            .Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()");
    }
}
