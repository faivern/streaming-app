using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class ListsFeatureBackbone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContainsSpoilers",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "IsPublic",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "MediaEntries");

            migrationBuilder.AddColumn<double>(
                name: "RatingActing",
                table: "MediaEntries",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "RatingSoundtrack",
                table: "MediaEntries",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "RatingStory",
                table: "MediaEntries",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "RatingVisuals",
                table: "MediaEntries",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailPath",
                table: "Lists",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RatingActing",
                table: "MediaEntries");

            migrationBuilder.DropColumn(
                name: "RatingSoundtrack",
                table: "MediaEntries");

            migrationBuilder.DropColumn(
                name: "RatingStory",
                table: "MediaEntries");

            migrationBuilder.DropColumn(
                name: "RatingVisuals",
                table: "MediaEntries");

            migrationBuilder.DropColumn(
                name: "ThumbnailPath",
                table: "Lists");

            migrationBuilder.AddColumn<bool>(
                name: "ContainsSpoilers",
                table: "Reviews",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublic",
                table: "Reviews",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "Rating",
                table: "MediaEntries",
                type: "integer",
                nullable: true);
        }
    }
}
