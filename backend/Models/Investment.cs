using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LifeRpg.Backend.Models;

[Table("investments")]
public class Investment
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("objective_id")]
    public Guid? ObjectiveId { get; set; }

    [Column("skill_id")]
    public Guid? SkillId { get; set; }

    [Required]
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Column("type")]
    public string Type { get; set; } = "money"; // money, time, course, tool, other

    [Column("amount")]
    public decimal? Amount { get; set; }

    [Column("estimated_time")]
    public string? EstimatedTime { get; set; }

    [Column("url")]
    public string? Url { get; set; }

    [Column("status")]
    public string Status { get; set; } = "planned"; // planned, in_progress, completed

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [JsonIgnore]
    public User? User { get; set; }

    [JsonIgnore]
    public Objective? Objective { get; set; }

    [JsonIgnore]
    public Skill? Skill { get; set; }
}
