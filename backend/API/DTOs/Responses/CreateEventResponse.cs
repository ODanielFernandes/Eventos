using RestApi.Models;

namespace RestApi.DTOs.Responses;

public class CreateEventResponse
{
    public string message { get; set; } = string.Empty;
    public Event @event { get; set; } = null!;
}