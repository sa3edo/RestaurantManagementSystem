using Models.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Services.IServices
{
    public interface ITableService
    {
        Task<IEnumerable<Table>> GetTablesByRestaurantAsync(int restaurantId);
        Task<Table?> GetTableByIdAsync(int tableId);
        Task<Table> CreateTableAsync(Table table);
        Task<Table?> UpdateTableAsync(int tableId, Table table);
        Task<bool> DeleteTableAsync(int tableId);
    }

}
