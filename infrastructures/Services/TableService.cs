using infrastructures.Services.IServices;
using infrastructures.UnitOfWork;
using Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Services
{
    public class TableService : ITableService
    {
        private readonly IUnitOfWork _unitOfWork;

        public TableService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<Table>> GetTablesByRestaurantAsync(int restaurantId) =>
            await _unitOfWork.table.GetAsync(expression: t =>t.RestaurantId == restaurantId);

        public async Task<Table?> GetTableByIdAsync(int tableId) =>
            await _unitOfWork.table.GetOneAsync(expression: t => t.TableId == tableId);

        public async Task<Table> CreateTableAsync(Table table)
        {
            await _unitOfWork.table.CreateAsync(table);
            await _unitOfWork.CompleteAsync();
            return table;
        }

        public async Task<Table?> UpdateTableAsync(int tableId, Table table)
        {
            var existingTable = await _unitOfWork.table.GetOneAsync(expression: t => t.TableId == tableId);
            if (existingTable == null) return null;

            existingTable.Seats = table.Seats;
            _unitOfWork.table.Edit(existingTable);
            await _unitOfWork.CompleteAsync();
            return existingTable;
        }

        public async Task<bool> DeleteTableAsync(int tableId)
        {
            var table = await _unitOfWork.table.GetOneAsync(expression: t => t.TableId == tableId);
            if (table == null) return false;

            _unitOfWork.table.Delete(table);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }

}
