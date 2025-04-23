using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace infrastructures.Migrations
{
    /// <inheritdoc />
    public partial class TimeSlot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_TimeSlots_TimeSlotID",
                table: "Reservations");

            migrationBuilder.AddColumn<int>(
                name: "TimeSlotID1",
                table: "Reservations",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_TimeSlotID1",
                table: "Reservations",
                column: "TimeSlotID1");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_TimeSlots_TimeSlotID",
                table: "Reservations",
                column: "TimeSlotID",
                principalTable: "TimeSlots",
                principalColumn: "TimeSlotID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_TimeSlots_TimeSlotID1",
                table: "Reservations",
                column: "TimeSlotID1",
                principalTable: "TimeSlots",
                principalColumn: "TimeSlotID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_TimeSlots_TimeSlotID",
                table: "Reservations");

            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_TimeSlots_TimeSlotID1",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_TimeSlotID1",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "TimeSlotID1",
                table: "Reservations");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_TimeSlots_TimeSlotID",
                table: "Reservations",
                column: "TimeSlotID",
                principalTable: "TimeSlots",
                principalColumn: "TimeSlotID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
