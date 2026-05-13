using System.ComponentModel.DataAnnotations;

namespace RestApi.DTOs.Requests;

public class CreateEventRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string Location { get; set; } = string.Empty;

    [Required]
    public DateTime DateTime { get; set; }
}