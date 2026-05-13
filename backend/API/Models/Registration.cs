using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestApi.Models;

[Table("registrations")]
public class Registration
{
    [Key, Column("REGISTRATION_ID")]
    public long Id { get; set; }

    [Required, Column("USER_ID")]
    public long UserId { get; set; }

    [Required, Column("EVENT_ID")]
    public long EventId { get; set; }

    public User? User { get; set; }
    public Event? Event { get; set; }
}