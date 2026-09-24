#!/usr/bin/env bash
# One-time bootstrap: obtains the first Let's Encrypt certificate for
# CommitMuseum and switches nginx from the checked-in HTTP-only config to
# the full HTTPS config.
#
# Run this ONCE on the VPS, from the repo root, after `docker compose up -d`
# has been used at least once with the bootstrap (HTTP-only) config so the
# domain's DNS is already pointing at this server:
#
#   ./docker/certbot/init-letsencrypt.sh yourdomain.com you@example.com
#
# Re-running it is safe (certbot reuses an existing valid cert instead of
# re-issuing). Renewal afterwards is a separate, recurring step — see
# README.md.

set -euo pipefail

DOMAIN="${1:?Usage: $0 <domain> <email>}"
EMAIL="${2:?Usage: $0 <domain> <email>}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "==> Pointing the bootstrap nginx config at ${DOMAIN}"
sed -i "s/commitmuseum\.example\.com/${DOMAIN}/g" docker/nginx/conf.d/commitmuseum.conf

echo "==> Starting app + nginx (HTTP only, for the ACME challenge)"
docker compose up -d app nginx

echo "==> Requesting certificate from Let's Encrypt"
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d "${DOMAIN}" \
  --email "${EMAIL}" \
  --agree-tos \
  --no-eff-email

echo "==> Installing the full HTTPS nginx config"
DOMAIN="${DOMAIN}" envsubst '${DOMAIN}' \
  < docker/nginx/templates/commitmuseum.tls.conf.template \
  > docker/nginx/conf.d/commitmuseum.conf

echo "==> Reloading nginx"
docker compose exec nginx nginx -s reload

echo "==> Done. https://${DOMAIN} should now be serving CommitMuseum over TLS."
echo "    Set up periodic renewal (see README.md) so the certificate doesn't expire."
