using System;
using System.Threading;
using System.Threading.Tasks;
using infrastructures.UnitOfWork;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Models.Models;

public class DataCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DataCleanupService> _logger;

    public DataCleanupService(IServiceProvider serviceProvider, ILogger<DataCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

                await CleanOldOrderItems(unitOfWork);
                await CleanOldOrders(unitOfWork);
                await CleanOldReservations(unitOfWork);
                await CleanPendingReservations(unitOfWork);  
            }

            await Task.Delay(TimeSpan.FromHours(6), stoppingToken);
        }
    }

    private async Task CleanOldOrderItems(IUnitOfWork unitOfWork)
    {
        var expirationDate = DateTime.UtcNow.AddHours(-6); 

        var oldOrderItems = await unitOfWork.orderItem.GetAsync(expression: oi => oi.CreatedAt < expirationDate);
        foreach (var item in oldOrderItems)
        {
            unitOfWork.orderItem.Delete(item);
        }

        await unitOfWork.CompleteAsync();
        _logger.LogInformation("✅ OrderItems older than 6 hours have been deleted.");
    }

    private async Task CleanOldOrders(IUnitOfWork unitOfWork)
    {
        var expirationDate = DateTime.UtcNow.AddHours(-24);

        var oldOrders = await unitOfWork.order.GetAsync(expression: o => o.CreatedAt < expirationDate);
        foreach (var order in oldOrders)
        {
            var orderItems = await unitOfWork.orderItem.GetAsync(expression: oi => oi.OrderID == order.OrderID);
            foreach (var item in orderItems)
            {
                unitOfWork.orderItem.Delete(item);
            }
            unitOfWork.order.Delete(order);
        }

        await unitOfWork.CompleteAsync();
        _logger.LogInformation("✅ Orders and OrderItems older than 24 hours have been deleted.");
    }

    private async Task CleanOldReservations(IUnitOfWork unitOfWork)
    {
        var expirationDate = DateTime.UtcNow.AddDays(-2);

        var oldReservations = await unitOfWork.reservation.GetAsync(expression: r => r.ReservationDate < expirationDate);
        foreach (var reservation in oldReservations)
        {
            unitOfWork.reservation.Delete(reservation);
        }

        await unitOfWork.CompleteAsync();
        _logger.LogInformation("✅ Reservations older than 2 days have been deleted.");
    }

    private async Task CleanPendingReservations(IUnitOfWork unitOfWork)
    {
        var expirationDate = DateTime.UtcNow.AddHours(-24);

        var pendingReservations = await unitOfWork.reservation.GetAsync(expression: r => r.Status == ReservationStatus.Pending && r.CreatedAt < expirationDate);
        foreach (var reservation in pendingReservations)
        {
            unitOfWork.reservation.Delete(reservation);
        }

        await unitOfWork.CompleteAsync();
        _logger.LogInformation("✅ Pending reservations older than 24 hours have been deleted.");
    }
}
