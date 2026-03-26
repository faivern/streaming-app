using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using Pgvector;

#nullable disable

namespace backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAiDiscoverySchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:vector", ",,");

            migrationBuilder.CreateTable(
                name: "ai_query_logs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: false),
                    query_text = table.Column<string>(type: "text", nullable: false),
                    result_tmdb_ids = table.Column<string>(type: "text", nullable: true),
                    response_time_ms = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ai_query_logs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "movie_embeddings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tmdb_id = table.Column<int>(type: "integer", nullable: false),
                    media_type = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    overview = table.Column<string>(type: "text", nullable: true),
                    genres = table.Column<string>(type: "text", nullable: true),
                    keywords = table.Column<string>(type: "text", nullable: true),
                    cast_crew = table.Column<string>(type: "text", nullable: true),
                    release_year = table.Column<int>(type: "integer", nullable: true),
                    vote_average = table.Column<double>(type: "double precision", nullable: true),
                    content_text = table.Column<string>(type: "text", nullable: false),
                    embedding = table.Column<Vector>(type: "vector(1536)", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_movie_embeddings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_movie_embeddings_embedding",
                table: "movie_embeddings",
                column: "embedding")
                .Annotation("Npgsql:IndexMethod", "hnsw")
                .Annotation("Npgsql:IndexOperators", new[] { "vector_cosine_ops" })
                .Annotation("Npgsql:StorageParameter:ef_construction", 64)
                .Annotation("Npgsql:StorageParameter:m", 16);

            migrationBuilder.CreateIndex(
                name: "IX_movie_embeddings_tmdb_id_media_type",
                table: "movie_embeddings",
                columns: new[] { "tmdb_id", "media_type" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ai_query_logs");

            migrationBuilder.DropTable(
                name: "movie_embeddings");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:vector", ",,");
        }
    }
}
