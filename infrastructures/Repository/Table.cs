using infrastructures.Repository.IRepository;
using Models.Models;
using RestaurantManagementSystem.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace infrastructures.Repository
{
   public  class Table : Repository<Models.Models.Table>,ITable
    {
        public Table(ApplicationDbContext dbContext) : base(dbContext)
        {

        }
    }
}
