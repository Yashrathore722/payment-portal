namespace PaymentsPortal.API.Models;

public class Payment
{
    public int Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string ClientRequestId { get; set; } = string.Empty;
}
