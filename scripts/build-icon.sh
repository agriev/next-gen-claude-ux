#!/usr/bin/env bash
# Regenerate platform icons from resources/icon.svg.
#
# Output:
#   resources/icon.png  — 1024×1024 master, used by electron-builder for Linux
#                         and as a fallback to auto-generate .ico for Windows
#   resources/icon.icns — macOS multi-res icon
#
# Requires `rsvg-convert` (brew install librsvg) and `iconutil` (macOS only).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SVG="$ROOT/resources/icon.svg"
PNG="$ROOT/resources/icon.png"
ICNS="$ROOT/resources/icon.icns"

if ! command -v rsvg-convert >/dev/null 2>&1; then
  echo "rsvg-convert not found. Install with: brew install librsvg" >&2
  exit 1
fi

echo "→ $PNG"
rsvg-convert -w 1024 -h 1024 "$SVG" -o "$PNG"

if [[ "$(uname -s)" == "Darwin" ]] && command -v iconutil >/dev/null 2>&1; then
  echo "→ $ICNS"
  ICONSET="$(mktemp -d)/icon.iconset"
  mkdir -p "$ICONSET"
  for s in 16 32 128 256 512; do
    rsvg-convert -w "$s"          -h "$s"          "$SVG" -o "$ICONSET/icon_${s}x${s}.png"
    rsvg-convert -w "$((s * 2))" -h "$((s * 2))" "$SVG" -o "$ICONSET/icon_${s}x${s}@2x.png"
  done
  iconutil -c icns -o "$ICNS" "$ICONSET"
  rm -rf "$(dirname "$ICONSET")"
fi

echo "Done."
