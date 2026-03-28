using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PaymentsPortal.API.Data;
using PaymentsPortal.API.DTOs;
using PaymentsPortal.API.Services;
using Xunit;

namespace PaymentsPortal.Tests;

public class PaymentServiceTests
{
    private static PaymentsDbContext CreateInMemoryContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<PaymentsDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new PaymentsDbContext(options);
    }

    // ── Create ────────────────────────────────────────────────────────────

    [Fact]
    public async Task CreatePayment_ShouldGenerateReference_WithCorrectFormat()
    {
        using var ctx = CreateInMemoryContext(nameof(CreatePayment_ShouldGenerateReference_WithCorrectFormat));
        var svc = new PaymentService(ctx);

        var req = new CreatePaymentRequest { ClientRequestId = Guid.NewGuid().ToString(), Amount = 100, Currency = "USD" };
        var (payment, isNew) = await svc.CreatePaymentAsync(req);

        isNew.Should().BeTrue();
        payment.Reference.Should().MatchRegex(@"^PAY-\d{8}-\d{4}$");
    }

    [Fact]
    public async Task CreatePayment_ShouldIncrementSequence_PerDay()
    {
        using var ctx = CreateInMemoryContext(nameof(CreatePayment_ShouldIncrementSequence_PerDay));
        var svc = new PaymentService(ctx);

        var req1 = new CreatePaymentRequest { ClientRequestId = Guid.NewGuid().ToString(), Amount = 100, Currency = "USD" };
        var req2 = new CreatePaymentRequest { ClientRequestId = Guid.NewGuid().ToString(), Amount = 250, Currency = "EUR" };

        var (p1, _) = await svc.CreatePaymentAsync(req1);
        var (p2, _) = await svc.CreatePaymentAsync(req2);

        // Both should share the same date prefix
        p1.Reference[..13].Should().Be(p2.Reference[..13]);

        // Sequence should increment
        var seq1 = int.Parse(p1.Reference[14..]);
        var seq2 = int.Parse(p2.Reference[14..]);
        seq2.Should().Be(seq1 + 1);
    }

    [Fact]
    public async Task CreatePayment_WithDuplicateClientRequestId_ShouldReturnExistingPayment()
    {
        using var ctx = CreateInMemoryContext(nameof(CreatePayment_WithDuplicateClientRequestId_ShouldReturnExistingPayment));
        var svc = new PaymentService(ctx);

        var clientRequestId = Guid.NewGuid().ToString();
        var req = new CreatePaymentRequest { ClientRequestId = clientRequestId, Amount = 100, Currency = "USD" };

        var (first, isNew1) = await svc.CreatePaymentAsync(req);
        var (second, isNew2) = await svc.CreatePaymentAsync(req);

        isNew1.Should().BeTrue();
        isNew2.Should().BeFalse();
        second.Id.Should().Be(first.Id);
        second.Reference.Should().Be(first.Reference);
    }

    [Fact]
    public async Task CreatePayment_ShouldPersistAllFields()
    {
        using var ctx = CreateInMemoryContext(nameof(CreatePayment_ShouldPersistAllFields));
        var svc = new PaymentService(ctx);

        var clientId = Guid.NewGuid().ToString();
        var req = new CreatePaymentRequest { ClientRequestId = clientId, Amount = 199.99m, Currency = "GBP" };

        var (payment, _) = await svc.CreatePaymentAsync(req);

        payment.Amount.Should().Be(199.99m);
        payment.Currency.Should().Be("GBP");
        payment.ClientRequestId.Should().Be(clientId);
        payment.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    // ── Read ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAllPayments_ShouldReturnOrderedByCreatedAtDescending()
    {
        using var ctx = CreateInMemoryContext(nameof(GetAllPayments_ShouldReturnOrderedByCreatedAtDescending));
        var svc = new PaymentService(ctx);

        await svc.CreatePaymentAsync(new CreatePaymentRequest { ClientRequestId = Guid.NewGuid().ToString(), Amount = 10, Currency = "USD" });
        await svc.CreatePaymentAsync(new CreatePaymentRequest { ClientRequestId = Guid.NewGuid().ToString(), Amount = 20, Currency = "EUR" });

        var payments = (await svc.GetAllPaymentsAsync()).ToList();

        payments.Should().HaveCount(2);
        payments[0].Amount.Should().Be(20); // newest first
    }

    // ── Update ────────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdatePayment_ShouldChangeAmountAndCurrency()
    {
        using var ctx = CreateInMemoryContext(nameof(UpdatePayment_ShouldChangeAmountAndCurrency));
        var svc = new PaymentService(ctx);

        var (created, _) = await svc.CreatePaymentAsync(new CreatePaymentRequest { ClientRequestId = Guid.NewGuid().ToString(), Amount = 100, Currency = "USD" });

        var updated = await svc.UpdatePaymentAsync(created.Id, new UpdatePaymentRequest { Amount = 999, Currency = "INR" });

        updated.Should().NotBeNull();
        updated!.Amount.Should().Be(999);
        updated.Currency.Should().Be("INR");
        updated.Reference.Should().Be(created.Reference); // reference unchanged
    }

    [Fact]
    public async Task UpdatePayment_WithInvalidId_ShouldReturnNull()
    {
        using var ctx = CreateInMemoryContext(nameof(UpdatePayment_WithInvalidId_ShouldReturnNull));
        var svc = new PaymentService(ctx);

        var result = await svc.UpdatePaymentAsync(999, new UpdatePaymentRequest { Amount = 50, Currency = "USD" });

        result.Should().BeNull();
    }

    // ── Delete ────────────────────────────────────────────────────────────

    [Fact]
    public async Task DeletePayment_ShouldRemoveRecord()
    {
        using var ctx = CreateInMemoryContext(nameof(DeletePayment_ShouldRemoveRecord));
        var svc = new PaymentService(ctx);

        var (created, _) = await svc.CreatePaymentAsync(new CreatePaymentRequest { ClientRequestId = Guid.NewGuid().ToString(), Amount = 50, Currency = "EUR" });

        var deleted = await svc.DeletePaymentAsync(created.Id);
        var remaining = await svc.GetAllPaymentsAsync();

        deleted.Should().BeTrue();
        remaining.Should().BeEmpty();
    }

    [Fact]
    public async Task DeletePayment_WithInvalidId_ShouldReturnFalse()
    {
        using var ctx = CreateInMemoryContext(nameof(DeletePayment_WithInvalidId_ShouldReturnFalse));
        var svc = new PaymentService(ctx);

        var result = await svc.DeletePaymentAsync(999);
        result.Should().BeFalse();
    }
}
