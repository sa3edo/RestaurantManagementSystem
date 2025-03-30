using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace infrastructures.Migrations
{
    /// <inheritdoc />
    public partial class Img : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImgUrl",
                table: "Restaurants",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImgUrl",
                table: "MenuItems",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImgUrl",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "ImgUrl",
                table: "MenuItems");
        }
    }
}
