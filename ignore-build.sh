#!/bin/bash

# Get changed files from the last commit
CHANGED_FILES=$(git diff --name-only HEAD^ HEAD)

# Find the first-level project that changed
CHANGED_PROJECT=""

for FILE in $CHANGED_FILES; do
  if [[ $FILE == npm/*/jsx/* ]]; then
    CHANGED_PROJECT=$(echo "$FILE" | cut -d'/' -f2)  # Extracts project name
    break
  fi
done

if [ -n "$CHANGED_PROJECT" ]; then
  echo "Detected changes in npm/$CHANGED_PROJECT/jsx. Deploying..."
  cd npm/$CHANGED_PROJECT/jsx
  npm install  # Ensure dependencies are installed
  npm run build
  exit 0
else
  echo "No relevant changes detected. Skipping build."
  exit 1
fi
