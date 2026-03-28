using System.ComponentModel.DataAnnotations;

namespace PaymentsPortal.API.DTOs;

public class CreatePaymentRequest
{
    [Required]
    public string ClientRequestId { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }

    [Required]
    [RegularExpression("^(USD|EUR|INR|GBP)$", ErrorMessage = "Currency must be USD, EUR, INR, or GBP")]
    public string Currency { get; set; } = string.Empty;
}

public class UpdatePaymentRequest
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }

    [Required]
    [RegularExpression("^(USD|EUR|INR|GBP)$", ErrorMessage = "Currency must be USD, EUR, INR, or GBP")]
    public string Currency { get; set; } = string.Empty;
}

public class PaymentResponse
{
    public int Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string ClientRequestId { get; set; } = string.Empty;
}
