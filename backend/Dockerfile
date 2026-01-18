# Backend Dockerfile - Multi-stage build for .NET 8
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies (layer caching)
COPY backend.csproj .
RUN dotnet restore

# Copy everything else and build
COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install curl for healthcheck and openssl for HTTPS cert generation
RUN apt-get update && apt-get install -y --no-install-recommends curl openssl && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN adduser --disabled-password --gecos "" appuser

# Copy published app
COPY --from=build /app/publish .
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Create and set ownership for the HTTPS cert directory and Data Protection keys
RUN mkdir /https && chown appuser:appuser /https
RUN mkdir /keys && chown appuser:appuser /keys

# Change ownership and switch to non-root user
RUN chown -R appuser:appuser /app
USER appuser

# Expose port (Kestrel default)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fk https://localhost:8080/health || exit 1

# Set environment variables
ENV ASPNETCORE_URLS=https://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["/app/entrypoint.sh"]
