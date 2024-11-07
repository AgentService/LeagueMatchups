#!/bin/bash

# Check if the version type is provided as an argument (patch, minor, major)
if [ -z "$1" ]; then
  echo "Usage: ./release.sh [patch|minor|major]"
  exit 1
fi
git add .
git commit -m "Release version $(node -p "require('./package.json').version")"
git tag -a v$(node -p "require('./package.json').version") -m "Release version $(node -p "require('./package.json').version")"
# Step 1: Update the version
npm version $1 || exit 1

# Step 2: Commit and tag the version
git add .

# Step 3: Push commits and tags to origin
git push origin --follow-tags || exit 1

# Step 4: Build the app
npm run build || exit 1

echo "✅ Release process completed successfully!"
