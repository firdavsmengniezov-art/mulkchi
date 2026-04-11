using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mulkchi.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingHoldAndImageVariants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MediumUrl",
                table: "PropertyImages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                table: "PropertyImages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BookingHolds",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PropertyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CheckInDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CheckOutDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingHolds", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookingHolds_ExpiresAt",
                table: "BookingHolds",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_BookingHolds_PropertyId",
                table: "BookingHolds",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_BookingHolds_PropertyId_ExpiresAt",
                table: "BookingHolds",
                columns: new[] { "PropertyId", "ExpiresAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookingHolds");

            migrationBuilder.DropColumn(
                name: "MediumUrl",
                table: "PropertyImages");

            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                table: "PropertyImages");
        }
    }
}
