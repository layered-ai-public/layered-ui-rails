#!/bin/sh
# Install the layered-ui-rails agent skill globally for Claude Code.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/layered-ai-public/layered-ui-rails/main/install-skill.sh | sh

set -e

# Where the skill will be installed
DEST="$HOME/.claude/skills/layered-ui-rails"
REPO="layered-ai-public/layered-ui-rails"
SKILL_PATH=".claude/skills/layered-ui-rails"
API="https://api.github.com/repos/$REPO/git/trees/main?recursive=1"
RAW="https://raw.githubusercontent.com/$REPO/main"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Installing layered-ui-rails agent skill..."

# Fetch the repo's file tree from the GitHub API
TREE="$TMP/tree.json"
curl -fsSL "$API" -o "$TREE"

# Extract skill file paths from the tree (matching our skill directory)
grep "\"path\": \"$SKILL_PATH/" "$TREE" > "$TMP/files.txt" || true

# Download each file into the temp directory.
# Uses file redirection (not a pipe) so the loop runs in the current shell,
# ensuring set -e and exit 1 work correctly on download failure.
while read -r line; do
  file=$(echo "$line" | sed "s|.*\"path\": \"$SKILL_PATH/||" | sed 's/".*//')
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

echo "Installed layered-ui-rails agent skill to $DEST"
