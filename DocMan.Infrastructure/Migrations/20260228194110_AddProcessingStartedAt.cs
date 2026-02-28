using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocMan.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProcessingStartedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "FailureReason",
                table: "Documents",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(4000)",
                oldMaxLength: 4000,
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProcessingStartedAtUtc",
                table: "Documents",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProcessingStartedAtUtc",
                table: "Documents");

            migrationBuilder.AlterColumn<string>(
                name: "FailureReason",
                table: "Documents",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(512)",
                oldMaxLength: 512,
                oldNullable: true);
        }
    }
}
