using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mulkchi.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Keep data compatible with upcoming nvarchar(450) + unique index.
            migrationBuilder.Sql(
                """
                UPDATE [Users]
                SET [Email] = LEFT([Email], 450)
                WHERE [Email] IS NOT NULL
                  AND LEN([Email]) > 450;
                """);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Currency",
                table: "Properties",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "ExchangeRate",
                table: "Properties",
                type: "decimal(18,6)",
                precision: 18,
                scale: 6,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.Sql(
                """
                ;WITH DuplicateUsers AS
                (
                    SELECT [Id],
                           ROW_NUMBER() OVER (
                               PARTITION BY [Email]
                               ORDER BY [CreatedDate], [Id]) AS [RowNumber]
                    FROM [Users]
                    WHERE [Email] IS NOT NULL
                )
                UPDATE [u]
                -- Move duplicate emails to an RFC-reserved non-routable domain while keeping rows unique/traceable.
                SET [Email] = CONCAT('duplicate+', CONVERT(nvarchar(36), [u].[Id]), '@mulkchi.invalid')
                FROM [Users] AS [u]
                INNER JOIN DuplicateUsers AS [du] ON [u].[Id] = [du].[Id]
                WHERE [du].[RowNumber] > 1;
                """);

            migrationBuilder.Sql(
                """
                ;WITH DuplicateFavorites AS
                (
                    SELECT [Id],
                           ROW_NUMBER() OVER (
                               PARTITION BY [UserId], [PropertyId]
                               ORDER BY [CreatedDate], [Id]) AS [RowNumber]
                    FROM [Favorites]
                )
                DELETE [f]
                FROM [Favorites] AS [f]
                INNER JOIN DuplicateFavorites AS [df] ON [f].[Id] = [df].[Id]
                WHERE [df].[RowNumber] > 1;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Role",
                table: "Users",
                column: "Role");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_PropertyId",
                table: "Reviews",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ReviewerId",
                table: "Reviews",
                column: "ReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_CreatedDate",
                table: "Properties",
                column: "CreatedDate");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_HostId",
                table: "Properties",
                column: "HostId");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_ListingType",
                table: "Properties",
                column: "ListingType");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_Region",
                table: "Properties",
                column: "Region");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_Region_Status_ListingType",
                table: "Properties",
                columns: new[] { "Region", "Status", "ListingType" });

            migrationBuilder.CreateIndex(
                name: "IX_Properties_Status",
                table: "Properties",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ReceiverId",
                table: "Messages",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_SenderId",
                table: "Messages",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_UserId_PropertyId",
                table: "Favorites",
                columns: new[] { "UserId", "PropertyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_CheckInDate",
                table: "Bookings",
                column: "CheckInDate");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_CheckOutDate",
                table: "Bookings",
                column: "CheckOutDate");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_Status",
                table: "Bookings",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_Role",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_PropertyId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_ReviewerId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Properties_CreatedDate",
                table: "Properties");

            migrationBuilder.DropIndex(
                name: "IX_Properties_HostId",
                table: "Properties");

            migrationBuilder.DropIndex(
                name: "IX_Properties_ListingType",
                table: "Properties");

            migrationBuilder.DropIndex(
                name: "IX_Properties_Region",
                table: "Properties");

            migrationBuilder.DropIndex(
                name: "IX_Properties_Region_Status_ListingType",
                table: "Properties");

            migrationBuilder.DropIndex(
                name: "IX_Properties_Status",
                table: "Properties");

            migrationBuilder.DropIndex(
                name: "IX_Messages_ReceiverId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Messages_SenderId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Favorites_UserId_PropertyId",
                table: "Favorites");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_CheckInDate",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_CheckOutDate",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_Status",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "ExchangeRate",
                table: "Properties");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);
        }
    }
}
