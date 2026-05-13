namespace RestApi.DTOs.Responses;

public class LoginResponse
{
    public string message { get; set; } = string.Empty;
    public string token { get; set; } = string.Empty;
}