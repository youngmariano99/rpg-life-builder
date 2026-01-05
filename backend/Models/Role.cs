using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LifeRpg.Backend.Models;

[Table("roles")]
public class Role
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Required]
    [Column("icon")]
    public string Icon { get; set; } = "circle";

    [Required]
    [Column("color")]
    public string Color { get; set; } = "bg-slate-500";

    [Column("level")]
    public int Level { get; set; } = 1;

    [Column("current_xp")]
    public int CurrentXp { get; set; } = 0;

    [Column("xp_to_next_level")]
    public int XpToNextLevel { get; set; } = 100;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [JsonIgnore]
    public User? User { get; set; }
    
    public ICollection<Quest> Quests { get; set; } = new List<Quest>();
    public ICollection<Skill> Skills { get; set; } = new List<Skill>();
}
