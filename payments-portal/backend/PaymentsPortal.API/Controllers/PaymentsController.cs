using Microsoft.AspNetCore.Mvc;
using PaymentsPortal.API.DTOs;
using PaymentsPortal.API.Services;

namespace PaymentsPortal.API.Controllers;

[ApiController]
[Route("api/payments")]
[Produces("application/json")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(IPaymentService paymentService, ILogger<PaymentsController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    /// <summary>GET /api/payments – Returns all payments ordered by creation date (newest first).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PaymentResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var payments = await _paymentService.GetAllPaymentsAsync();
        return Ok(payments);
    }

    /// <summary>
    /// POST /api/payments – Creates a payment.
    /// If the same clientRequestId is submitted again, returns the existing record (idempotent).
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(PaymentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(PaymentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePaymentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (payment, isNew) = await _paymentService.CreatePaymentAsync(request);

        if (isNew)
        {
            _logger.LogInformation("Created payment {Reference} for ClientRequestId {ClientRequestId}", payment.Reference, request.ClientRequestId);
            return CreatedAtAction(nameof(GetAll), new { id = payment.Id }, payment);
        }

        _logger.LogInformation("Duplicate ClientRequestId {ClientRequestId} – returning existing payment {Reference}", request.ClientRequestId, payment.Reference);
        return Ok(payment); // idempotent: return existing record
    }

    /// <summary>PUT /api/payments/{id} – Updates amount and currency of an existing payment.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(PaymentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePaymentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var payment = await _paymentService.UpdatePaymentAsync(id, request);
        if (payment == null)
            return NotFound(new { message = $"Payment with id {id} not found." });

        _logger.LogInformation("Updated payment {Id}", id);
        return Ok(payment);
    }

    /// <summary>DELETE /api/payments/{id} – Deletes a payment by id.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _paymentService.DeletePaymentAsync(id);
        if (!deleted)
            return NotFound(new { message = $"Payment with id {id} not found." });

        _logger.LogInformation("Deleted payment {Id}", id);
        return NoContent();
    }
}
