#!/bin/sh
set -eu

SOURCE=/usr/share/nginx/html
TARGET=/tmp/tilted-html
DEFAULT_PUBLIC_URL=https://github.com/hallveticapro/Tilted
DEFAULT_SHARE_IMAGE_URL=https://raw.githubusercontent.com/hallveticapro/Tilted/main/public/assets/tilted-cover.png

rm -rf "$TARGET"
mkdir -p "$TARGET"
cp -R "$SOURCE"/. "$TARGET"/

escape_sed() {
  printf '%s' "$1" | sed 's/[&|]/\\&/g'
}

PUBLIC_URL=$(escape_sed "${TILTED_PUBLIC_URL:-$DEFAULT_PUBLIC_URL}")
SHARE_IMAGE_URL=$(escape_sed "${TILTED_SHARE_IMAGE_URL:-$DEFAULT_SHARE_IMAGE_URL}")

sed -i \
  -e "s|$DEFAULT_PUBLIC_URL|$PUBLIC_URL|g" \
  -e "s|$DEFAULT_SHARE_IMAGE_URL|$SHARE_IMAGE_URL|g" \
  "$TARGET/index.html"
