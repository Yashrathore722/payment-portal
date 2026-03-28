using Microsoft.EntityFrameworkCore;
using PaymentsPortal.API.Data;
using PaymentsPortal.API.DTOs;
using PaymentsPortal.API.Models;

namespace PaymentsPortal.API.Services;

public class PaymentService : IPaymentService
{
    private readonly PaymentsDbContext _context;
    private static readonly SemaphoreSlim _referenceLock = new(1, 1);

    public PaymentService(PaymentsDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PaymentResponse>> GetAllPaymentsAsync()
    {
        var payments = await _context.Payments
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return payments.Select(MapToResponse);
    }

    public async Task<(PaymentResponse Payment, bool IsNew)> CreatePaymentAsync(CreatePaymentRequest request)
    {
        // Idempotency check: same clientRequestId returns existing payment
        var existing = await _context.Payments
            .FirstOrDefaultAsync(p => p.ClientRequestId == request.ClientRequestId);

        if (existing != null)
            return (MapToResponse(existing), false);

        await _referenceLock.WaitAsync();
        try
        {
            var now = DateTime.UtcNow;
            var reference = await GenerateReferenceAsync(now);

            var payment = new Payment
            {
                ClientRequestId = request.ClientRequestId,
                Amount = request.Amount,
                Currency = request.Currency,
                Reference = reference,
                CreatedAt = now
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return (MapToResponse(payment), true);
        }
        finally
        {
            _referenceLock.Release();
        }
    }

    public async Task<PaymentResponse?> UpdatePaymentAsync(int id, UpdatePaymentRequest request)
    {
        var payment = await _context.Payments.FindAsync(id);
        if (payment == null) return null;

        payment.Amount = request.Amount;
        payment.Currency = request.Currency;

        await _context.SaveChangesAsync();
        return MapToResponse(payment);
    }

    public async Task<bool> DeletePaymentAsync(int id)
    {
        var payment = await _context.Payments.FindAsync(id);
        if (payment == null) return false;

        _context.Payments.Remove(payment);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Generates a reference in format PAY-YYYYMMDD-#### (sequential per day).
    /// Must be called within the _referenceLock.
    /// </summary>
    private async Task<string> GenerateReferenceAsync(DateTime date)
    {
        var dateStr = date.ToString("yyyyMMdd");
        var prefix = $"PAY-{dateStr}-";

        // Find the highest sequence number for today
        var todayPayments = await _context.Payments
            .Where(p => p.Reference.StartsWith(prefix))
            .Select(p => p.Reference)
            .ToListAsync();

        var maxSequence = todayPayments
            .Select(r =>
            {
                var parts = r.Split('-');
                return parts.Length == 3 && int.TryParse(parts[2], out var seq) ? seq : 0;
            })
            .DefaultIfEmpty(0)
            .Max();

        var nextSequence = maxSequence + 1;
        return $"{prefix}{nextSequence:D4}";
    }

    private static PaymentResponse MapToResponse(Payment payment) => new()
    {
        Id = payment.Id,
        Reference = payment.Reference,
        Amount = payment.Amount,
        Currency = payment.Currency,
        CreatedAt = payment.CreatedAt,
        ClientRequestId = payment.ClientRequestId
    };
}
