using System.ComponentModel.DataAnnotations;

#nullable disable

namespace Mulkchi.Api.Models.Foundations.Auth;

public class RegisterRequest
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    
    [Phone]
    [RegularExpression(@"^\+998[0-9]{9}$", ErrorMessage = "Telefon raqam formati: +998901234567")]
    public string Phone { get; set; }
    
    public string Password { get; set; }
    public string PreferredLanguage { get; set; }
}
