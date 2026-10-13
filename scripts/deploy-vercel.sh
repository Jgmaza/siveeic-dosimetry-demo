#!/usr/bin/env bash
# Build Angular 7 via Docker (Node 14 / amd64) and deploy prebuilt static output to Vercel.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${TMPDIR:-/tmp}/siveeic-vercel-$$"
cd "$ROOT"

docker build --platform=linux/amd64 -f Dockerfile.demo -t siveeic-dosimetry-demo .

rm -rf "$OUT"
mkdir -p "$OUT/.vercel/output/static"
CID=$(docker create siveeic-dosimetry-demo)
docker cp "$CID:/usr/share/nginx/html/." "$OUT/.vercel/output/static/"
docker rm "$CID" >/dev/null

printf '%s\n' '{"version":3,"routes":[{"handle":"filesystem"},{"src":"/(.*)","dest":"/index.html"}]}' \
  > "$OUT/.vercel/output/config.json"

mkdir -p "$OUT/.vercel"
cp "$ROOT/.vercel/project.json" "$OUT/.vercel/"

cd "$OUT"
npx vercel deploy --prebuilt --prod --yes --scope jose-mazas-projects
rm -rf "$OUT"
