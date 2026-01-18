#!/bin/sh
set -eu

CERT_PASSWORD="${ASPNETCORE_HTTPS_PASSWORD:-${ASPNETCORE_Kestrel__Certificates__Default__Password:-devcertpassword}}"
if [ -z "$CERT_PASSWORD" ]; then
  echo "HTTPS cert password is not set; cannot create HTTPS certificate." >&2
  exit 1
fi

if [ ! -f /https/aspnetapp.pfx ]; then
  # Generate a self-signed cert for localhost and export as PFX for Kestrel.
  openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout /https/aspnetapp.key \
    -out /https/aspnetapp.crt \
    -days 365 \
    -subj "/CN=localhost"

  openssl pkcs12 -export \
    -out /https/aspnetapp.pfx \
    -inkey /https/aspnetapp.key \
    -in /https/aspnetapp.crt \
    -password pass:"$CERT_PASSWORD"

  rm -f /https/aspnetapp.key /https/aspnetapp.crt
fi

exec dotnet backend.dll
