using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LifeRpg.Backend.Models;

[Table("objectives")]
public class Objective
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("role_id")]
    public Guid? RoleId { get; set; }

    [Required]
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Required]
    [Column("quarter")]
    public string Quarter { get; set; } = "Q1";

    [Column("year")]
    public int Year { get; set; } = DateTime.Now.Year;

    [Column("status")]
    public string Status { get; set; } = "pending"; // pending, in_progress, completed, failed

    [Column("xp_reward")]
    public int XpReward { get; set; }

    [Column("deadline")]
    public DateTime Deadline { get; set; }

    [Column("completed_at")]
    public DateTime? CompletedAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [JsonIgnore]
    public User? User { get; set; }

    [JsonIgnore]
    public Role? Role { get; set; }
}
