using PaymentsPortal.API.DTOs;

namespace PaymentsPortal.API.Services;

public interface IPaymentService
{
    Task<IEnumerable<PaymentResponse>> GetAllPaymentsAsync();
    Task<(PaymentResponse Payment, bool IsNew)> CreatePaymentAsync(CreatePaymentRequest request);
    Task<PaymentResponse?> UpdatePaymentAsync(int id, UpdatePaymentRequest request);
    Task<bool> DeletePaymentAsync(int id);
}
