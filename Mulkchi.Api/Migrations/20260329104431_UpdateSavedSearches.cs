using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mulkchi.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSavedSearches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SearchQuery",
                table: "SavedSearches");

            migrationBuilder.RenameColumn(
                name: "UpdatedDate",
                table: "SavedSearches",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "NotifyOnMatch",
                table: "SavedSearches",
                newName: "NotifyByPush");

            migrationBuilder.RenameColumn(
                name: "DeletedDate",
                table: "SavedSearches",
                newName: "LastNotifiedAt");

            migrationBuilder.RenameColumn(
                name: "CreatedDate",
                table: "SavedSearches",
                newName: "CreatedAt");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "SavedSearches",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "SavedSearches",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedAt",
                table: "SavedSearches",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "SavedSearches",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ListingType",
                table: "SavedSearches",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "MaxArea",
                table: "SavedSearches",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MaxPrice",
                table: "SavedSearches",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "MinArea",
                table: "SavedSearches",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinBedrooms",
                table: "SavedSearches",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MinPrice",
                table: "SavedSearches",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "NotifyByEmail",
                table: "SavedSearches",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "SavedSearches",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "SavedSearches");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "SavedSearches");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "SavedSearches");

            migrationBuilder.DropColumn(
                name: "ListingType",
                table: "SavedSearches");

            migrationBuilder.DropColumn(
                name: "MaxArea",
                table: "SavedSearches");

            migrationBuilder.DropColumn(
                name: "MaxPrice",
                table: "SavedSearches");

            migrationBuilder.DropColumn(
                name: "MinArea",
                table: "SavedSearches");

            migrationBuilder.DropColumn(
                name: "MinBedrooms",
                table: "SavedSearches");

            migrationBuilder.DropColumn(
                name: "MinPrice",
                table: "SavedSearches");

            migrationBuilder.DropColumn(
                name: "NotifyByEmail",
                table: "SavedSearches");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "SavedSearches");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "SavedSearches",
                newName: "UpdatedDate");

            migrationBuilder.RenameColumn(
                name: "NotifyByPush",
                table: "SavedSearches",
                newName: "NotifyOnMatch");

            migrationBuilder.RenameColumn(
                name: "LastNotifiedAt",
                table: "SavedSearches",
                newName: "DeletedDate");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "SavedSearches",
                newName: "CreatedDate");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "SavedSearches",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<string>(
                name: "SearchQuery",
                table: "SavedSearches",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
