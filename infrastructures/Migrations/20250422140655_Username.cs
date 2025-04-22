using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace infrastructures.Migrations
{
    /// <inheritdoc />
    public partial class Username : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Restaurants_RestaurantID",
                table: "Orders");

            migrationBuilder.AddColumn<int>(
                name: "RestaurantID1",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_RestaurantID1",
                table: "Orders",
                column: "RestaurantID1");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Restaurants_RestaurantID",
                table: "Orders",
                column: "RestaurantID",
                principalTable: "Restaurants",
                principalColumn: "RestaurantID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Restaurants_RestaurantID1",
                table: "Orders",
                column: "RestaurantID1",
                principalTable: "Restaurants",
                principalColumn: "RestaurantID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Restaurants_RestaurantID",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Restaurants_RestaurantID1",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_RestaurantID1",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "RestaurantID1",
                table: "Orders");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Restaurants_RestaurantID",
                table: "Orders",
                column: "RestaurantID",
                principalTable: "Restaurants",
                principalColumn: "RestaurantID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
