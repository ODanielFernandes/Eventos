using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestApi.Models;

[Table("events")]
public class Event
{
    [Key, Column("EVENT_ID")]
    public long Id { get; set; }

    [Required, MaxLength(100), Column("EVENT_NAME")]
    public string Name { get; set; } = string.Empty;

    [Required, Column("EVENT_DESCRIPTION")]
    public string Description { get; set; } = string.Empty;

    [Required, Column("EVENT_LOCATION")]
    public string Location { get; set; } = string.Empty;

    [Required, Column("DATE_TIME")]
    public DateTime DateTime { get; set; }

    [Column("USER_ID")]
    public long UserId { get; set; }

    public User? Owner { get; set; }
}