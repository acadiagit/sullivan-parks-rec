#!/usr/bin/env bash
# move-legacy.sh
# Path: ~/coworker/parks/move-legacy.sh
# Desc: Archive Phase-1-era admin form skeletons that are superseded by ContentForm.js.
#       Files are MOVED (not deleted) to src/components/admin/legacy/ so they remain
#       available for reference during Phase 2 cutover.
# ============================================================
set -euo pipefail

cd "$(dirname "$0")"
TARGET=src/components/admin/legacy
mkdir -p "$TARGET"

for f in ArticleForm.js ParkForm.js ProgramForm.js ProjectForm.js ContentList.js ImagePicker.js; do
  src=src/components/admin/$f
  if [ -f "$src" ]; then
    mv "$src" "$TARGET/$f"
    echo "  ✓ moved $f → legacy/"
  else
    echo "  · $f not present, skipping"
  fi
done

echo
echo "Legacy admin files now in: $TARGET"
echo "Active admin files in: src/components/admin/"
echo
echo "Verify with: ls -la src/components/admin/ src/components/admin/legacy/"
# end of file
