using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LifeRpg.Backend.Models;

[Table("skills")]
public class Skill
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("role_id")]
    public Guid RoleId { get; set; }

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Required]
    [Column("icon")]
    public string Icon { get; set; } = "zap";

    [Column("cost_xp")]
    public int CostXp { get; set; } = 0;

    [Column("cost_money")]
    public decimal? CostMoney { get; set; }

    [Column("cost_time")]
    public string? CostTime { get; set; }

    [Column("is_unlocked")]
    public bool IsUnlocked { get; set; } = false;

    [Column("is_available")]
    public bool IsAvailable { get; set; } = false;

    [Column("parent_skill_id")]
    public Guid? ParentSkillId { get; set; }

    [Column("position_x")]
    public int PositionX { get; set; } = 0;

    [Column("position_y")]
    public int PositionY { get; set; } = 0;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [JsonIgnore]
    public Role? Role { get; set; }

    [JsonIgnore]
    public Skill? ParentSkill { get; set; }

    public ICollection<Skill> ChildSkills { get; set; } = new List<Skill>();
}
