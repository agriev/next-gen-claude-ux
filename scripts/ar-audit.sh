#!/usr/bin/env bash
# ar-audit.sh — enforce AR-readiness invariants in renderer/src/scene/.
#
# What it checks:
#   1. No drei <Html> usage inside scene/ (use scene/text/Label.tsx instead).
#   2. No browser-only DOM APIs (document.*, window.*) in scene/.
#   3. No direct OrbitControls / OrbitControlsImpl imports outside camera/.
#
# Exit 0 = clean, exit 1 = at least one violation.
#
# Run manually:    bash scripts/ar-audit.sh
# Run in CI:       npm run ar-audit  (after package.json wires it up)
#
# This is enforced because waves 2..8 add many new R3F primitives. Any
# regression here drags us back into the E2 refactor we just avoided.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCENE_DIR="$REPO_ROOT/renderer/src/scene"

if [[ ! -d "$SCENE_DIR" ]]; then
  echo "ar-audit: scene/ dir not found at $SCENE_DIR" >&2
  exit 1
fi

VIOLATIONS=0

# Allow current legacy <Html> only in the three known files until they are
# fully migrated in a follow-up card. NEW files must NOT introduce <Html>.
LEGACY_HTML_FILES=(
  "renderer/src/scene/Edge.tsx"
  "renderer/src/scene/Artifact.tsx"
)

# Allow current legacy document.* usage only in these files. They will be
# migrated to OffscreenCanvas (or moved out of scene/) before E3 visionOS port.
LEGACY_DOM_FILES=(
  "renderer/src/scene/card-texture.ts"
)

echo "▸ scanning $SCENE_DIR for AR-readiness violations..."

# 1. <Html> usage — literal JSX tag, not the word "Html" in a comment
HTML_HITS=$(grep -rln "<Html\b" "$SCENE_DIR" | while read -r f; do
  rel="${f#$REPO_ROOT/}"
  skip=0
  for legacy in "${LEGACY_HTML_FILES[@]}"; do
    if [[ "$rel" == "$legacy" ]]; then skip=1; break; fi
  done
  if [[ "$skip" -eq 0 ]]; then echo "$rel"; fi
done)

if [[ -n "$HTML_HITS" ]]; then
  echo "✗ <Html> found in non-whitelisted scene file(s):"
  echo "$HTML_HITS" | sed 's/^/    /'
  echo "  → use renderer/src/scene/text/Label.tsx instead."
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# 2. browser-only DOM APIs (document., HTMLElement.) — window. is used for window.api which is the IPC bridge, allow
DOM_HITS=$(grep -rln -E "(^|[^a-zA-Z_\.])document\.|HTMLElement" "$SCENE_DIR" | while read -r f; do
  rel="${f#$REPO_ROOT/}"
  skip=0
  for legacy in "${LEGACY_DOM_FILES[@]}"; do
    if [[ "$rel" == "$legacy" ]]; then skip=1; break; fi
  done
  if [[ "$skip" -eq 0 ]]; then echo "$rel"; fi
done)

if [[ -n "$DOM_HITS" ]]; then
  echo "✗ browser-only DOM API used in scene/:"
  echo "$DOM_HITS" | sed 's/^/    /'
  echo "  → DOM APIs do not work in WebXR sessions. Move logic out of scene/."
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# 3. OrbitControls imports outside camera/
ORBIT_HITS=$(grep -rln "OrbitControls" "$SCENE_DIR" | grep -v "/camera/" || true)
if [[ -n "$ORBIT_HITS" ]]; then
  echo "✗ direct OrbitControls reference outside scene/camera/:"
  echo "$ORBIT_HITS" | sed 's/^/    /'
  echo "  → consume controls via CameraController interface (scene/camera/CameraController.ts)."
  VIOLATIONS=$((VIOLATIONS + 1))
fi

if [[ "$VIOLATIONS" -eq 0 ]]; then
  echo "✓ ar-audit clean."
  exit 0
else
  echo ""
  echo "✗ $VIOLATIONS AR-readiness violation(s) — see above."
  exit 1
fi
