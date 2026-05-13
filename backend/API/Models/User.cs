using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestApi.Models;

[Table("users")]
public class User
{
    [Key, Column("USER_ID")]
    public long Id { get; set; }

    [Required, MaxLength(100), Column("EMAIL")]
    public string Email { get; set; } = string.Empty;

    [Required, Column("PASSWORD")]
    public string Password { get; set; } = string.Empty;
}