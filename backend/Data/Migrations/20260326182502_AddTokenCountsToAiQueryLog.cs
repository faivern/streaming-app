using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTokenCountsToAiQueryLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "completion_tokens",
                table: "ai_query_logs",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "prompt_tokens",
                table: "ai_query_logs",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "completion_tokens",
                table: "ai_query_logs");

            migrationBuilder.DropColumn(
                name: "prompt_tokens",
                table: "ai_query_logs");
        }
    }
}
