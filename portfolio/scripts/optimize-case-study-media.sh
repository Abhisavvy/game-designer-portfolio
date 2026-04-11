#!/usr/bin/env bash
# Encode case-study clips for the portfolio (requires ffmpeg).
# Usage: ./scripts/optimize-case-study-media.sh path/to/input.mov food-fiesta/feature-demo.mp4

set -euo pipefail
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install ffmpeg, then re-run."
  exit 1
fi

in="${1:-}"
out_rel="${2:-}"
if [[ -z "$in" || -z "$out_rel" ]]; then
  echo "Usage: $0 <input> <output under public/assets, e.g. food-fiesta/demo.mp4>"
  exit 1
fi

root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/public/assets/$out_rel"
mkdir -p "$(dirname "$out")"

ffmpeg -y -i "$in" \
  -c:v libx264 -preset medium -crf 23 \
  -vf "scale='min(1920,iw)':-2" \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  "$out"

echo "Wrote $out"
