using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTmdbDynamicFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FirstAirDate",
                table: "MediaEntries",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastTmdbSync",
                table: "MediaEntries",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NumberOfEpisodes",
                table: "MediaEntries",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NumberOfSeasons",
                table: "MediaEntries",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReleaseDate",
                table: "MediaEntries",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Runtime",
                table: "MediaEntries",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BackdropPath",
                table: "ListItems",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FirstAirDate",
                table: "ListItems",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastTmdbSync",
                table: "ListItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NumberOfEpisodes",
                table: "ListItems",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NumberOfSeasons",
                table: "ListItems",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Overview",
                table: "ListItems",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReleaseDate",
                table: "ListItems",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Runtime",
                table: "ListItems",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "VoteAverage",
                table: "ListItems",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FirstAirDate",
                table: "MediaEntries");

            migrationBuilder.DropColumn(
                name: "LastTmdbSync",
                table: "MediaEntries");

            migrationBuilder.DropColumn(
                name: "NumberOfEpisodes",
                table: "MediaEntries");

            migrationBuilder.DropColumn(
                name: "NumberOfSeasons",
                table: "MediaEntries");

            migrationBuilder.DropColumn(
                name: "ReleaseDate",
                table: "MediaEntries");

            migrationBuilder.DropColumn(
                name: "Runtime",
                table: "MediaEntries");

            migrationBuilder.DropColumn(
                name: "BackdropPath",
                table: "ListItems");

            migrationBuilder.DropColumn(
                name: "FirstAirDate",
                table: "ListItems");

            migrationBuilder.DropColumn(
                name: "LastTmdbSync",
                table: "ListItems");

            migrationBuilder.DropColumn(
                name: "NumberOfEpisodes",
                table: "ListItems");

            migrationBuilder.DropColumn(
                name: "NumberOfSeasons",
                table: "ListItems");

            migrationBuilder.DropColumn(
                name: "Overview",
                table: "ListItems");

            migrationBuilder.DropColumn(
                name: "ReleaseDate",
                table: "ListItems");

            migrationBuilder.DropColumn(
                name: "Runtime",
                table: "ListItems");

            migrationBuilder.DropColumn(
                name: "VoteAverage",
                table: "ListItems");
        }
    }
}
