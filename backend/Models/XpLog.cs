using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LifeRpg.Backend.Models;

[Table("xp_logs")]
public class XpLog
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("role_id")]
    public Guid? RoleId { get; set; }

    [Required]
    [Column("source_type")]
    public string SourceType { get; set; } = "quest"; // quest, objective, bonus

    [Column("source_id")]
    public Guid SourceId { get; set; }

    [Column("xp_amount")]
    public int XpAmount { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [JsonIgnore]
    public User? User { get; set; }

    [JsonIgnore]
    public Role? Role { get; set; }
}
