using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LifeRpg.Backend.Models;

[Table("quest_logs")]
public class QuestLog
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("quest_id")]
    public Guid QuestId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("completed_at")]
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

    [Column("xp_earned")]
    public int XpEarned { get; set; }

    // Navigation properties
    [JsonIgnore]
    public Quest? Quest { get; set; }

    [JsonIgnore]
    public User? User { get; set; }
}
