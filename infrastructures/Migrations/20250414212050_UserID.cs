using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace infrastructures.Migrations
{
    /// <inheritdoc />
    public partial class UserID : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ManagerID",
                table: "Restaurants",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "FoodCategories",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "applicationUserId",
                table: "FoodCategories",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_FoodCategories_applicationUserId",
                table: "FoodCategories",
                column: "applicationUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_FoodCategories_AspNetUsers_applicationUserId",
                table: "FoodCategories",
                column: "applicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FoodCategories_AspNetUsers_applicationUserId",
                table: "FoodCategories");

            migrationBuilder.DropIndex(
                name: "IX_FoodCategories_applicationUserId",
                table: "FoodCategories");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "FoodCategories");

            migrationBuilder.DropColumn(
                name: "applicationUserId",
                table: "FoodCategories");

            migrationBuilder.AlterColumn<string>(
                name: "ManagerID",
                table: "Restaurants",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }
    }
}
