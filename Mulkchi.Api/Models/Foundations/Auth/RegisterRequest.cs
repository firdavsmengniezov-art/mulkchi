using System.ComponentModel.DataAnnotations;

#nullable disable

namespace Mulkchi.Api.Models.Foundations.Auth;

public class RegisterRequest
{
    [Required(ErrorMessage = "Ism talab qilinadi")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Ism 2-50 belgidan iborat bo'lishi kerak")]
    public string FirstName { get; set; }
    
    [Required(ErrorMessage = "Familiya talab qilinadi")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Familiya 2-50 belgidan iborat bo'lishi kerak")]
    public string LastName { get; set; }
    
    [Required(ErrorMessage = "Email talab qilinadi")]
    [EmailAddress(ErrorMessage = "Email noto'g'ri formatda")]
    public string Email { get; set; }
    
    [Required(ErrorMessage = "Telefon raqam talab qilinadi")]
    [Phone(ErrorMessage = "Telefon raqami noto'g'ri formatda")]
    public string Phone { get; set; }
    
    [Required(ErrorMessage = "Parol talab qilinadi")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Parol 6-100 belgidan iborat bo'lishi kerak")]
    public string Password { get; set; }
    
    public string PreferredLanguage { get; set; } = "uz";
}
