# Azure Deployment Guide — Cinelas

This guide walks through deploying Cinelas to Azure from scratch. It assumes you have never deployed to the cloud before and explains the "why" behind each step.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Secrets Inventory](#2-secrets-inventory)
3. [Hardcoded Defaults to Remove](#3-hardcoded-defaults-to-remove)
4. [Step-by-Step Deployment](#4-step-by-step-deployment)
   - [x] [Phase A: Azure Account & Tooling](#phase-a-azure-account--tooling)
   - [x] [Phase B: Resource Group & Container Registry](#phase-b-resource-group--container-registry)
   - [x] [Phase C: Managed PostgreSQL Database](#phase-c-managed-postgresql-database)
   - [x] [Phase D: Build & Push Docker Images](#phase-d-build--push-docker-images)
   - [x] [Phase E: Deploy Backend Container App](#phase-e-deploy-backend-container-app)
   - [x] [Phase F: Deploy Frontend Container App](#phase-f-deploy-frontend-container-app)
   - [ ] [Phase G: Key Vault & Managed Identity](#phase-g-key-vault--managed-identity)
   - [ ] [Phase H: Custom Domain & HTTPS](#phase-h-custom-domain--https)
   - [ ] [Phase I: Google OAuth Update](#phase-i-google-oauth-update)
   - [ ] [Phase J: Code Changes for Production](#phase-j-code-changes-for-production)
   - [ ] [Phase K: CI/CD with GitHub Actions](#phase-k-cicd-with-github-actions)
5. [Verification Checklist](#5-verification-checklist)
6. [Cost Estimation](#6-cost-estimation)
7. [Key Concepts Glossary](#7-key-concepts-glossary)

## Deployment Progress

**Completed 2026-03-17:**
- Phases A-F complete. App is live and serving data.
- Region: `westeurope`
- Resource Group: `cinelas-rg`
- Backend URL: `https://cinelas-backend.blackmushroom-7632a67c.westeurope.azurecontainerapps.io`
- Frontend URL: `https://cinelas-frontend.blackmushroom-7632a67c.westeurope.azurecontainerapps.io`
- Database: `cinelas-db-server.postgres.database.azure.com`
- Container Registry: `cinelasacr.azurecr.io`
- Frontend image: `cinelas-frontend:v3` (with SNI fix)
- Backend image: `cinelas-backend:v1`

**Fixes applied during deployment:**
- Added `backend.Tests/` and `backend.sln` to `backend/.dockerignore` (build was failing trying to build test project)
- Updated `frontend/nginx.conf`: changed `proxy_pass` from `https://backend:8080` to Azure backend FQDN
- Added `proxy_ssl_server_name on;` to nginx.conf (required for Azure SNI routing)
- Backend runs HTTP internally (`ASPNETCORE_URLS=http://+:8080`) — Azure handles TLS termination

**In progress (waiting for DNS/Google propagation):**

Phase H — Custom Domain:
- [x] Added DNS records in Namecheap Advanced DNS:
  - TXT record: `asuid` → `D3735B41FFC8ECFACE71D7BE37945847E514FAD3D12B95AFF30BC832C383D4B6`
  - CNAME: `www` → `cinelas-frontend.blackmushroom-7632a67c.westeurope.azurecontainerapps.io`
  - URL Redirect (301): `@` → `https://www.cinelas.com`
- [ ] After DNS propagates, run:
  ```bash
  az containerapp hostname add --name cinelas-frontend --resource-group cinelas-rg --hostname www.cinelas.com
  ```
- [ ] Then bind the HTTPS certificate:
  ```bash
  az containerapp hostname bind --name cinelas-frontend --resource-group cinelas-rg --hostname www.cinelas.com --environment cinelas-env --validation-method CNAME
  ```
- [ ] Update backend env vars for the custom domain:
  ```bash
  az containerapp update --name cinelas-backend --resource-group cinelas-rg --set-env-vars "CorsOrigins=https://www.cinelas.com,https://cinelas-frontend.blackmushroom-7632a67c.westeurope.azurecontainerapps.io" "FrontendUrl=https://www.cinelas.com"
  ```
- [ ] Update nginx.conf to also proxy `/signin-google` to the backend (required for OAuth through www.cinelas.com)
- [ ] Rebuild and redeploy frontend after nginx.conf change

Phase I — Google OAuth:
- [x] Added to Google Cloud Console:
  - Redirect URIs: `https://cinelas-backend.blackmushroom-7632a67c.westeurope.azurecontainerapps.io/signin-google`, `https://www.cinelas.com/signin-google`
  - JS Origins: `https://cinelas-frontend.blackmushroom-7632a67c.westeurope.azurecontainerapps.io`, `https://www.cinelas.com`
  - Kept existing localhost entries for local dev
- [ ] Test Google login via Azure frontend URL once Google propagates
- [ ] Test Google login via www.cinelas.com once domain is live

**Remaining TODO:**
- Phase G: Move secrets from plaintext env vars to Key Vault with Managed Identity
- Phase J: Add forwarded headers middleware to Program.cs, simplify production entrypoint.sh
- Phase K: GitHub Actions CI/CD pipeline for automated deployments

---

## 1. Architecture Overview

### What you have locally (Docker Compose)

```
Browser → localhost:3000 (nginx serves React) → /api/* proxied to → localhost:7123 (.NET backend) → localhost:5432 (PostgreSQL)
```

All three services run in Docker containers on your machine, connected via a Docker network.

### What you'll have on Azure

```
Internet → cinelas.com (Azure CDN / Custom Domain)
              │
              ├── Frontend Container App (nginx + React static files)
              │     └── /api/* reverse-proxied to ──→ Backend Container App (.NET 8)
              │                                              │
              │                                              ├── Azure Database for PostgreSQL (managed)
              │                                              ├── TMDB API (external)
              │                                              └── Azure Key Vault (secrets)
              │
              └── Azure manages: TLS certs, scaling, load balancing, DNS
```

### Why these Azure services?

| Azure Service | Replaces | Why this one? |
|---|---|---|
| **Container Apps** | Docker Compose `backend` + `frontend` services | Runs your existing Docker images without managing servers. Scales to zero when idle (saves money). Simpler than Kubernetes (AKS). |
| **Azure Database for PostgreSQL Flexible Server** | Docker Compose `db` service | Managed database with automatic backups, patching, and failover. Your Docker volume `pgdata` would lose data if the VM dies — this won't. |
| **Azure Container Registry (ACR)** | Building images locally | Stores your Docker images in the cloud so Azure can pull them. Like Docker Hub but private and integrated with Azure auth. |
| **Azure Key Vault** | `.env` file | Encrypted, access-controlled secret storage. Your `.env` file should never exist in production. |
| **Managed Identity** | (nothing — you don't have this locally) | Lets your container authenticate to Key Vault without storing any credentials. Azure handles the trust automatically. |

---

## 2. Secrets Inventory

| Secret | Current Location | Action for Azure |
|--------|-----------------|------------------|
| `POSTGRES_PASSWORD` | `.env` / docker-compose fallback (`devpassword`) | Store in Key Vault, no fallback defaults in prod |
| `TMDB_API_KEY` | `.env` | Store in Key Vault |
| `GOOGLE_CLIENT_ID` | `.env` | Store in Key Vault |
| `GOOGLE_CLIENT_SECRET` | `.env` | Store in Key Vault |
| `PGADMIN_PASSWORD` | `.env` (dev only) | Don't deploy PgAdmin to production |
| `ASPNETCORE_HTTPS_PASSWORD` | `.env` (dev cert) | Azure handles TLS termination — not needed |
| ASP.NET Data Protection keys | Docker volume (`/keys`) | Use Azure Blob Storage for persistence |
| `CorsOrigins` / `FrontendUrl` | Hardcoded to `localhost` | Update to your Azure/custom domain |

---

## 3. Hardcoded Defaults to Remove

`docker-compose.yml` lines 14-16:
```yaml
POSTGRES_USER: ${POSTGRES_USER:-cinelas}
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-devpassword}
```

For production, these fallback defaults mean a missing secret silently uses `devpassword` instead of crashing. Create a separate `docker-compose.prod.yml` or rely on Azure env vars with no defaults.

---

## 4. Step-by-Step Deployment

### Phase A: Azure Account & Tooling

**Goal**: Get an Azure account and the CLI tool installed so you can run commands.

#### A1. Create an Azure Account

1. Go to https://azure.microsoft.com/free
2. Sign up (requires a credit card but won't charge you)
3. You get **$200 free credit for 30 days** + 12 months of free-tier services
4. A "subscription" is created automatically — this is Azure's billing boundary

> **What is a subscription?** Think of it like a billing account. All resources you create live under a subscription, and costs roll up to it. Most people have one subscription.

#### A2. Install Azure CLI

The Azure CLI (`az`) is how you'll create and manage all your cloud resources from the terminal.

```bash
# Install on WSL/Ubuntu
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Verify installation
az version

# Log in — opens a browser window for authentication
az login
```

After `az login`, your terminal is authenticated and can create/manage resources.

#### A3. Set default subscription (if you have multiple)

```bash
# List subscriptions
az account list --output table

# Set default (usually you only have one)
az account set --subscription "<subscription-id-or-name>"
```

---

### Phase B: Resource Group & Container Registry

**Goal**: Create a logical container for all Cinelas resources and a private registry to store your Docker images.

#### B1. Pick a region

Choose the Azure region closest to your users. Run this to see all options:

```bash
az account list-locations --output table
```

Common choices:
- `eastus` — cheapest, most services available (US East Coast)
- `westus2` — US West Coast
- `westeurope` — Netherlands
- `australiaeast` — Sydney

> **Why does region matter?** It determines where your servers physically run. Closer to your users = lower latency. Some regions are cheaper than others. Pick one and use it for everything.

#### B2. Create a Resource Group

```bash
az group create --name cinelas-rg --location eastus
```

> **What is a Resource Group?** A folder that holds related Azure resources. When you're done with Cinelas, you can delete the entire resource group and everything inside it gets cleaned up. It's also how Azure groups billing.

#### B3. Create an Azure Container Registry (ACR)

```bash
az acr create --name cinelasacr --resource-group cinelas-rg --sku Basic --admin-enabled true
```

- `--name` must be globally unique and alphanumeric only (no dashes)
- `--sku Basic` is the cheapest tier (~$5/month, included in free tier)
- `--admin-enabled true` lets you push images with a username/password (simpler for getting started)

Get the login credentials (you'll need these to push images):

```bash
# Log Docker into your registry
az acr login --name cinelasacr
```

> **What is a Container Registry?** It's like a private Docker Hub. Your built Docker images get pushed here, and Azure Container Apps pulls from here to run your app. It's private by default — only you (and services you authorize) can access it.

---

### Phase C: Managed PostgreSQL Database

**Goal**: Create a managed PostgreSQL server so you don't have to worry about database backups, updates, or data loss.

#### C1. Create the PostgreSQL Flexible Server

```bash
az postgres flexible-server create \
  --resource-group cinelas-rg \
  --name cinelas-db-server \
  --location eastus \
  --admin-user cinelas \
  --admin-password '<STRONG-PASSWORD-HERE>' \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 16 \
  --yes
```

- `Standard_B1ms` = smallest burstable instance (1 vCPU, 2GB RAM, ~$13/month)
- `--storage-size 32` = 32 GB storage (minimum)
- `--version 16` matches your local PostgreSQL 16

> **Why "Flexible Server"?** Azure has two PostgreSQL offerings. "Flexible Server" is the current-generation one with better pricing and features. The older "Single Server" is being retired. Always pick Flexible.

> **Burstable tier**: Your database idles most of the time but needs occasional CPU bursts (like when a user loads a page). Burstable means you pay for a low baseline and can burst higher temporarily — perfect for a new app that doesn't have constant traffic.

#### C2. Create the database

```bash
az postgres flexible-server db create \
  --resource-group cinelas-rg \
  --server-name cinelas-db-server \
  --database-name cinelas
```

#### C3. Configure firewall rules

By default, the managed database blocks ALL connections. You need to allow Azure services (your Container Apps) to reach it:

```bash
# Allow Azure services to connect (required for Container Apps)
az postgres flexible-server firewall-rule create \
  --resource-group cinelas-rg \
  --name cinelas-db-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

> **Why 0.0.0.0?** This special rule doesn't mean "open to everyone." In Azure, `0.0.0.0-0.0.0.0` specifically means "allow connections from other Azure services in my subscription." External traffic is still blocked.

#### C4. Note your connection string

Your backend will use this connection string (with real values filled in later via Key Vault):

```
Host=cinelas-db-server.postgres.database.azure.com;Port=5432;Database=cinelas;Username=cinelas;Password=<from-key-vault>;SSL Mode=Require;Trust Server Certificate=true
```

> **SSL Mode=Require**: Azure PostgreSQL enforces encrypted connections. Locally you didn't need this because your containers talked over a private Docker network. In the cloud, even "internal" traffic should be encrypted.

---

### Phase D: Build & Push Docker Images

**Goal**: Build your production Docker images and push them to ACR so Azure can run them.

#### D1. Build and push the backend image

```bash
# From the repo root
az acr build --registry cinelasacr --image cinelas-backend:v1 ./backend
```

> **Why `az acr build` instead of `docker build` + `docker push`?** This command sends your source code to Azure and builds it there. Benefits: (1) you don't need Docker running locally, (2) the build happens on Azure's servers (faster uploads for large images), (3) the image goes directly into your registry.

#### D2. Build and push the frontend image

```bash
az acr build --registry cinelasacr \
  --image cinelas-frontend:v1 \
  --build-arg VITE_AUTH_URL=https://<your-backend-domain> \
  ./frontend
```

**Important**: `VITE_AUTH_URL` is baked into the frontend at build time (Vite replaces it during compilation). You'll need to rebuild the frontend once you know your backend's URL. For the first deploy, you can use a placeholder and rebuild later.

> **Build args vs environment vars**: Your Vite app uses `VITE_AUTH_URL` at *build time* — it gets compiled into the JavaScript bundle. This is different from the backend's env vars which are read at *runtime*. This means changing `VITE_AUTH_URL` requires rebuilding the frontend image.

---

### Phase E: Deploy Backend Container App

**Goal**: Get your .NET backend running as a Container App.

#### E1. Create a Container Apps Environment

```bash
az containerapp env create \
  --name cinelas-env \
  --resource-group cinelas-rg \
  --location eastus
```

> **What is a Container Apps Environment?** It's a shared hosting boundary for your container apps. Apps in the same environment share a virtual network and can talk to each other internally. Think of it as the Azure equivalent of your Docker Compose network.

#### E2. Create the backend Container App

```bash
az containerapp create \
  --name cinelas-backend \
  --resource-group cinelas-rg \
  --environment cinelas-env \
  --image cinelasacr.azurecr.io/cinelas-backend:v1 \
  --registry-server cinelasacr.azurecr.io \
  --registry-username $(az acr credential show --name cinelasacr --query username -o tsv) \
  --registry-password $(az acr credential show --name cinelasacr --query "passwords[0].value" -o tsv) \
  --target-port 8080 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 3 \
  --cpu 0.5 \
  --memory 1Gi \
  --env-vars \
    ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_URLS=http://+:8080 \
    ConnectionStrings__DefaultConnection="Host=cinelas-db-server.postgres.database.azure.com;Port=5432;Database=cinelas;Username=cinelas;Password=<TEMP-REPLACE-WITH-KEYVAULT>;SSL Mode=Require;Trust Server Certificate=true" \
    TMDB__ApiKey="<TEMP-REPLACE-WITH-KEYVAULT>" \
    Authentication__Google__ClientId="<TEMP-REPLACE-WITH-KEYVAULT>" \
    Authentication__Google__ClientSecret="<TEMP-REPLACE-WITH-KEYVAULT>" \
    CorsOrigins="https://<your-frontend-url>" \
    FrontendUrl="https://<your-frontend-url>"
```

Key flags explained:
- `--target-port 8080` — your Dockerfile EXPOSEs 8080
- `--ingress external` — makes this accessible from the internet (you'll get a URL like `cinelas-backend.happyocean-abc123.eastus.azurecontainerapps.io`)
- `--min-replicas 0` — scales to zero when idle (saves money, but first request takes ~5-10 seconds cold start)
- `--min-replicas 1` — use this if you don't want cold starts (costs more)
- `--max-replicas 3` — auto-scales up to 3 instances under load
- `--cpu 0.5 --memory 1Gi` — half a CPU core and 1GB RAM (plenty for starting out)

> **Important change for production**: Your backend Dockerfile currently uses `ASPNETCORE_URLS=https://+:8080` and generates a self-signed cert via `entrypoint.sh`. In Azure Container Apps, TLS is terminated at the ingress layer (Azure handles HTTPS for you). Your container should listen on plain **HTTP** internally. You'll need to change the entrypoint — covered in Phase J.

#### E3. Get the backend URL

```bash
az containerapp show --name cinelas-backend --resource-group cinelas-rg --query "properties.configuration.ingress.fqdn" -o tsv
```

This returns something like: `cinelas-backend.happyocean-abc123.eastus.azurecontainerapps.io`

Save this — the frontend needs it.

---

### Phase F: Deploy Frontend Container App

**Goal**: Get your React frontend served via nginx and proxying API calls to the backend.

#### F1. Rebuild frontend with the real backend URL

Now that you know the backend URL, rebuild:

```bash
az acr build --registry cinelasacr \
  --image cinelas-frontend:v1 \
  --build-arg VITE_AUTH_URL=https://cinelas-backend.happyocean-abc123.eastus.azurecontainerapps.io \
  ./frontend
```

#### F2. Create the frontend Container App

```bash
az containerapp create \
  --name cinelas-frontend \
  --resource-group cinelas-rg \
  --environment cinelas-env \
  --image cinelasacr.azurecr.io/cinelas-frontend:v1 \
  --registry-server cinelasacr.azurecr.io \
  --registry-username $(az acr credential show --name cinelasacr --query username -o tsv) \
  --registry-password $(az acr credential show --name cinelasacr --query "passwords[0].value" -o tsv) \
  --target-port 80 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 3 \
  --cpu 0.25 \
  --memory 0.5Gi
```

- `--target-port 80` — nginx listens on 80 in your Dockerfile
- Frontend needs less CPU/RAM than backend since it's just serving static files

#### F3. Update nginx.conf for production

Your current `nginx.conf` proxies `/api/` to `https://backend:8080`. In Azure, the backend isn't called `backend` — it has its own domain. You'll need to update the proxy_pass. See Phase J for the exact change.

---

### Phase G: Key Vault & Managed Identity

**Goal**: Move secrets out of env var plaintext and into encrypted Key Vault storage. This is the most important security step.

#### G1. Create Key Vault

```bash
az keyvault create \
  --name cinelas-kv \
  --resource-group cinelas-rg \
  --location eastus
```

> **Key Vault names are globally unique.** If `cinelas-kv` is taken, try `cinelas-vault` or `cinelas-kv-<random>`.

#### G2. Add secrets

```bash
az keyvault secret set --vault-name cinelas-kv --name "PostgresPassword" --value "<your-strong-password>"
az keyvault secret set --vault-name cinelas-kv --name "TmdbApiKey" --value "<your-tmdb-key>"
az keyvault secret set --vault-name cinelas-kv --name "GoogleClientId" --value "<your-google-client-id>"
az keyvault secret set --vault-name cinelas-kv --name "GoogleClientSecret" --value "<your-google-secret>"
```

#### G3. Enable Managed Identity on the backend

```bash
az containerapp identity assign \
  --name cinelas-backend \
  --resource-group cinelas-rg \
  --system-assigned
```

This returns a `principalId` — save it:

```bash
PRINCIPAL_ID=$(az containerapp identity show \
  --name cinelas-backend \
  --resource-group cinelas-rg \
  --query principalId -o tsv)
```

> **What just happened?** Azure created a "virtual identity" for your container. It's like giving your app its own Azure account. Other Azure services (like Key Vault) can trust this identity without you managing passwords.

#### G4. Grant Key Vault access

```bash
az keyvault set-policy \
  --name cinelas-kv \
  --object-id $PRINCIPAL_ID \
  --secret-permissions get list
```

Now your backend container can read secrets from Key Vault — but only `get` and `list`, not `set` or `delete`.

#### G5. Wire secrets into Container App

```bash
# First, register secrets in the Container App (references to Key Vault)
az containerapp secret set --name cinelas-backend --resource-group cinelas-rg \
  --secrets \
    postgres-password="<your-strong-password>" \
    tmdb-api-key="<your-tmdb-key>" \
    google-client-id="<your-google-client-id>" \
    google-client-secret="<your-google-secret>"

# Then, update env vars to reference those secrets
az containerapp update --name cinelas-backend --resource-group cinelas-rg \
  --set-env-vars \
    ConnectionStrings__DefaultConnection="Host=cinelas-db-server.postgres.database.azure.com;Port=5432;Database=cinelas;Username=cinelas;Password=secretref:postgres-password;SSL Mode=Require;Trust Server Certificate=true" \
    TMDB__ApiKey=secretref:tmdb-api-key \
    Authentication__Google__ClientId=secretref:google-client-id \
    Authentication__Google__ClientSecret=secretref:google-client-secret
```

> **secretref:** is Container Apps' syntax for "pull this value from the secrets I registered." The actual secret values never appear in your Container App's configuration — they're resolved at runtime.

---

### Phase H: Custom Domain & HTTPS

**Goal**: Make your app available at a real domain (e.g., `cinelas.com`) with automatic HTTPS.

#### H1. Buy a domain (if you don't have one)

Options: Namecheap, Cloudflare, Google Domains, or Azure itself.

#### H2. Add custom domain to frontend Container App

```bash
# Get the verification code and IP
az containerapp hostname list \
  --name cinelas-frontend \
  --resource-group cinelas-rg

# Add the custom domain
az containerapp hostname add \
  --name cinelas-frontend \
  --resource-group cinelas-rg \
  --hostname cinelas.com
```

#### H3. Configure DNS records

At your domain registrar, add:
- **CNAME record**: `www` → `cinelas-frontend.<env-id>.eastus.azurecontainerapps.io`
- **A record** (for apex domain): point to the Container App's IP
- **TXT record**: for domain verification (Azure will tell you the exact value)

#### H4. Enable managed HTTPS certificate

```bash
az containerapp hostname bind \
  --name cinelas-frontend \
  --resource-group cinelas-rg \
  --hostname cinelas.com \
  --environment cinelas-env \
  --validation-method CNAME
```

Azure automatically provisions and renews a free TLS certificate. No need for Let's Encrypt or manual cert management.

> **TLS termination**: Azure handles HTTPS at the edge. Traffic arrives encrypted, Azure decrypts it, and forwards plain HTTP to your container on port 80. This is why your containers don't need to handle HTTPS themselves in production.

---

### Phase I: Google OAuth Update

**Goal**: Update Google OAuth so login works on your production domain.

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   - `https://cinelas.com/api/auth/google-callback`
   - `https://cinelas-backend.<env>.azurecontainerapps.io/api/auth/google-callback`
4. Add to **Authorized JavaScript origins**:
   - `https://cinelas.com`
5. Save

> **Why both URLs?** During initial setup and debugging, you'll want the raw Azure URL to work too. Once everything is stable, you can remove the raw Azure URL and only keep your custom domain.

---

### Phase J: Code Changes for Production

**Goal**: Small modifications to make your existing code work in Azure's environment.

#### J1. Backend: Remove self-signed cert generation

Your `entrypoint.sh` generates HTTPS certs. Azure handles TLS, so your container should run plain HTTP.

Create a production-specific entrypoint or modify the Dockerfile:

```dockerfile
# In backend Dockerfile, change:
ENV ASPNETCORE_URLS=https://+:8080
# To:
ENV ASPNETCORE_URLS=http://+:8080
```

And simplify the entrypoint for production:

```bash
#!/bin/sh
exec dotnet backend.dll
```

> **Best practice**: Use a build arg or separate Dockerfile stage for prod vs dev, so your local HTTPS setup still works during development.

#### J2. Frontend: Update nginx.conf for Azure

Your current `nginx.conf` proxies to `https://backend:8080`. In Azure, the backend has its own public URL.

**Option A: Proxy through nginx** (keeps current architecture)
```nginx
location /api/ {
    proxy_pass https://cinelas-backend.internal.<env>.eastus.azurecontainerapps.io/api/;
    # ... rest of proxy headers
    proxy_ssl_verify off;
}
```

**Option B: Use Container Apps internal networking** (better)
Since both apps are in the same Container Apps Environment, the backend gets an internal FQDN. You can configure the backend with `--ingress internal` for API calls from the frontend, and the frontend proxies to that internal URL. This avoids public internet round-trips for API calls.

```bash
# Check internal FQDN
az containerapp show --name cinelas-backend --resource-group cinelas-rg \
  --query "properties.configuration.ingress.fqdn" -o tsv
```

#### J3. Backend: Add forwarded headers middleware

When Azure terminates TLS, your .NET app receives HTTP requests but needs to know the original request was HTTPS (for cookie security, redirect URLs, etc.):

```csharp
// In Program.cs, before app.UseAuthentication()
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});
```

This is critical — without it, your auth cookies won't have `Secure=true` set correctly, and OAuth redirects may use `http://` instead of `https://`.

#### J4. Backend: Update CORS for production

Currently hardcoded in docker-compose:
```
CorsOrigins=http://localhost:3000,http://localhost:5173
```

Set via Container App env vars:
```
CorsOrigins=https://cinelas.com
FrontendUrl=https://cinelas.com
```

---

### Phase K: CI/CD with GitHub Actions (Optional but Recommended)

**Goal**: Automate deployments so pushing to `main` automatically builds and deploys to Azure.

#### K1. Create a service principal for GitHub

```bash
az ad sp create-for-rbac \
  --name "cinelas-github-deploy" \
  --role contributor \
  --scopes /subscriptions/<subscription-id>/resourceGroups/cinelas-rg \
  --sdk-auth
```

This outputs a JSON block — copy it.

#### K2. Add to GitHub Secrets

In your GitHub repo → Settings → Secrets and variables → Actions:
- `AZURE_CREDENTIALS` — paste the JSON from above
- `REGISTRY_LOGIN_SERVER` — `cinelasacr.azurecr.io`
- `REGISTRY_USERNAME` — from `az acr credential show`
- `REGISTRY_PASSWORD` — from `az acr credential show`

#### K3. Create workflow file

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Build and push backend image
        run: |
          az acr build --registry cinelasacr --image cinelas-backend:${{ github.sha }} ./backend

      - name: Deploy to Container App
        run: |
          az containerapp update \
            --name cinelas-backend \
            --resource-group cinelas-rg \
            --image cinelasacr.azurecr.io/cinelas-backend:${{ github.sha }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Build and push frontend image
        run: |
          az acr build --registry cinelasacr \
            --image cinelas-frontend:${{ github.sha }} \
            --build-arg VITE_AUTH_URL=https://cinelas.com \
            ./frontend

      - name: Deploy to Container App
        run: |
          az containerapp update \
            --name cinelas-frontend \
            --resource-group cinelas-rg \
            --image cinelasacr.azurecr.io/cinelas-frontend:${{ github.sha }}
```

> **Why `${{ github.sha }}` as the image tag?** Every commit gets a unique image tag. This means you can always trace which exact code is running in production, and you can roll back to any previous version by redeploying an older image tag.

---

## 5. Verification Checklist

Run through this after deployment:

### Security
- [ ] No `.env` file copied into container image (`az acr repository show-manifests` to inspect)
- [ ] No fallback defaults in production config
- [ ] Azure Portal → Container App → "Secrets" tab shows secrets (not plaintext env vars)
- [ ] `az containerapp exec --name cinelas-backend --resource-group cinelas-rg -- env | grep POSTGRES` shows correct values
- [ ] Data Protection keys persisted (users don't get logged out on container restart)
- [ ] Auth cookies use `Secure=true` + `SameSite=Lax` behind HTTPS

### Functionality
- [ ] Frontend loads at your domain
- [ ] API calls from frontend reach the backend (check browser DevTools Network tab)
- [ ] Google OAuth login works end-to-end
- [ ] TMDB data loads (movies, search, etc.)
- [ ] User can create lists and add media entries
- [ ] Database persists data across container restarts

### Performance
- [ ] `CorsOrigins` and `FrontendUrl` point to production domain
- [ ] Gzip enabled (check response headers for `Content-Encoding: gzip`)
- [ ] Static assets have cache headers (`Cache-Control: public, immutable`)

---

## 6. Cost Estimation

Approximate monthly costs on Azure (minimal tier):

| Service | SKU | Est. Cost |
|---------|-----|-----------|
| Container Apps (backend) | 0.5 vCPU, 1Gi, scale-to-zero | ~$0-15/mo (pay per use) |
| Container Apps (frontend) | 0.25 vCPU, 0.5Gi, scale-to-zero | ~$0-10/mo (pay per use) |
| PostgreSQL Flexible Server | Burstable B1ms | ~$13/mo |
| Container Registry | Basic | ~$5/mo |
| Key Vault | Standard | ~$0.03/mo (pennies) |
| **Total (idle/low traffic)** | | **~$20-45/mo** |

> **Scale-to-zero**: If nobody visits your site for a while, Container Apps scales your containers down to zero and you pay nothing for compute. The tradeoff is a 5-10 second cold start on the first request. Set `--min-replicas 1` to avoid cold starts (~$15/mo more per app).

> **Free tier**: The $200 credit covers roughly 4-10 months of the above, depending on traffic.

---

## 7. Key Concepts Glossary

| Term | Plain English |
|------|---------------|
| **Resource Group** | A folder that groups related Azure resources. Delete the folder = delete everything in it. |
| **Container Registry (ACR)** | Private Docker Hub. Stores your built images so Azure can pull and run them. |
| **Container Apps** | Serverless Docker runner. Give it an image, it runs it. Handles scaling, networking, TLS. |
| **Container Apps Environment** | Shared home for multiple Container Apps. They share a virtual network (like Docker Compose's network). |
| **Managed Identity** | A virtual identity Azure creates for your app. Other Azure services can trust it without passwords. |
| **Key Vault** | Encrypted safe for secrets. Your app reads secrets at runtime via Managed Identity. |
| **TLS Termination** | Azure handles HTTPS at the edge. Your containers receive plain HTTP internally. |
| **Ingress** | The networking layer that routes internet traffic to your container. Controls whether your app is public or internal-only. |
| **Scale-to-zero** | Container shuts down when idle, starts back up on the next request. Saves money, adds cold-start latency. |
| **Flexible Server** | Azure's current-generation managed PostgreSQL. Handles backups, patching, failover automatically. |
| **Service Principal** | An identity for automation tools (like GitHub Actions) to authenticate with Azure. |
| **FQDN** | Fully Qualified Domain Name — the complete URL Azure assigns your app (e.g., `cinelas-backend.happyocean-abc123.eastus.azurecontainerapps.io`). |
