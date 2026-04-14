#!/bin/sh
# Install the layered-ui-rails agent skill globally for Claude Code.
#
# Usage (from a local checkout):
#   ./install-skill.sh
#
# Usage (remote):
#   curl -fsSL https://raw.githubusercontent.com/layered-ai-public/layered-ui-rails/main/install-skill.sh | sh

set -e

# Where the skill will be installed
DEST="$HOME/.claude/skills/layered-ui-rails"
SKILL_PATH=".claude/skills/layered-ui-rails"

echo "Installing layered-ui-rails agent skill..."

# Detect whether we are running from inside the repository
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOCAL_SKILL="$SCRIPT_DIR/$SKILL_PATH"

if [ -f "$LOCAL_SKILL/SKILL.md" ]; then
  # Running from a local checkout - copy the files directly
  rm -rf "$DEST"
  mkdir -p "$(dirname "$DEST")"
  cp -R "$LOCAL_SKILL" "$DEST"
else
  # Running via curl - fetch from GitHub
  REPO="layered-ai-public/layered-ui-rails"
  API="https://api.github.com/repos/$REPO/git/trees/main?recursive=1"
  RAW="https://raw.githubusercontent.com/$REPO/main"
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT

  # Fetch the repo's file tree from the GitHub API
  TREE="$TMP/tree.json"
  curl -fsSL "$API" -o "$TREE"

  # Extract skill file paths from the tree (files only, skip directories).
  # Filter requires a dot in the filename after the skill prefix to exclude
  # bare directory names like "references" (the dot in ".claude" earlier in
  # the path was previously causing false positives).
  grep "\"path\": \"$SKILL_PATH/" "$TREE" \
    | sed "s|.*\"path\": \"$SKILL_PATH/||" \
    | sed 's/".*//' \
    | grep '\.' \
    > "$TMP/files.txt" || true

  # Download each file into the temp directory.
  # Uses file redirection (not a pipe) so the loop runs in the current shell,
  # ensuring set -e and exit 1 work correctly on download failure.
  while read -r file; do
    mkdir -p "$TMP/$(dirname "$file")"
    curl -fsSL "$RAW/$SKILL_PATH/$file" -o "$TMP/$file" || { echo "Error: failed to download $file" >&2; exit 1; }
  done < "$TMP/files.txt"

  # Clean up intermediate files
  rm -f "$TMP/files.txt"
  rm -f "$TREE"

  # Sanity check: SKILL.md must be present for a valid install
  if [ ! -f "$TMP/SKILL.md" ]; then
    echo "Error: failed to download skill files" >&2
    exit 1
  fi

  # Replace any existing install and move the new one into place
  rm -rf "$DEST"
  mkdir -p "$(dirname "$DEST")"
  mv "$TMP" "$DEST"
fi

echo "Installed layered-ui-rails agent skill to $DEST"
