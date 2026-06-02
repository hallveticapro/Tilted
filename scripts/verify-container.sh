#!/bin/sh
set -eu

IMAGE=${1:-tilted:verify}
NAME="tilted-verify-$$"
PUBLIC_URL=https://tilted.example.test
SHARE_IMAGE_URL=https://tilted.example.test/assets/cover.png

cleanup() {
  docker rm -f "$NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

docker build -t "$IMAGE" .
docker run --rm -d \
  --name "$NAME" \
  --read-only \
  --tmpfs /tmp:size=32m,mode=1777 \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  -e "TILTED_PUBLIC_URL=$PUBLIC_URL" \
  -e "TILTED_SHARE_IMAGE_URL=$SHARE_IMAGE_URL" \
  -p 127.0.0.1::8080 \
  "$IMAGE" >/dev/null

PORT=$(docker port "$NAME" 8080/tcp | sed 's/.*://')
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if curl --fail --silent "http://127.0.0.1:$PORT/healthz" >/dev/null; then
    break
  fi
  sleep 1
done

curl --fail --silent "http://127.0.0.1:$PORT/healthz" | grep -q '^ok$'
HEADERS=$(curl --fail --silent --head "http://127.0.0.1:$PORT/")
INDEX=$(curl --fail --silent "http://127.0.0.1:$PORT/")

for HEADER in \
  Content-Security-Policy \
  Permissions-Policy \
  Referrer-Policy \
  X-Content-Type-Options \
  X-Frame-Options
do
  printf '%s' "$HEADERS" | grep -qi "^$HEADER:"
done

printf '%s' "$INDEX" | grep -Fq "$PUBLIC_URL"
printf '%s' "$INDEX" | grep -Fq "$SHARE_IMAGE_URL"
printf '%s\n' "Container verification passed on port $PORT."
