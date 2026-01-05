using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LifeRpg.Backend.Models;

[Table("time_blocks")]
public class TimeBlock
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
    [Column("start_time")]
    public TimeSpan StartTime { get; set; }

    [Required]
    [Column("end_time")]
    public TimeSpan EndTime { get; set; }

    [Required]
    [Column("day_period")]
    public string DayPeriod { get; set; } = "morning"; // morning, afternoon, evening

    [Required]
    [Column("block_type")]
    public string BlockType { get; set; } = "focus"; // focus, rest, admin

    [Column("is_recurring")]
    public bool IsRecurring { get; set; } = false;

    [Column("days_of_week")]
    public int[]? DaysOfWeek { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [JsonIgnore]
    public User? User { get; set; }

    [JsonIgnore]
    public Role? Role { get; set; }
}
