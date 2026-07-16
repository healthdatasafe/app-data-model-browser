#!/usr/bin/env bash
# Deploy app-data-model-browser to gh-pages.
set -euo pipefail

scriptsFolder=$(cd $(dirname "$0"); pwd)
cd "$scriptsFolder/.."

MAIN_BRANCH="main"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" != "$MAIN_BRANCH" ]; then
  echo "ERROR: Deploy only allowed from '$MAIN_BRANCH' (current: $BRANCH)."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: Working tree is not clean."
  git status --short
  exit 1
fi

if [ ! -d dist/.git ]; then
  echo "ERROR: dist/ is not a gh-pages checkout. Run 'npm run setup' first."
  exit 1
fi

COMMIT_SHORT="$(git rev-parse --short HEAD)"
COMMIT_FULL="$(git rev-parse HEAD)"
echo "Deploying commit $COMMIT_SHORT ..."

# Reset dist/ to remote gh-pages HEAD so the deploy is idempotent regardless of
# any leftover local state (interrupted previous build, or gh-pages moved ahead
# from another machine — which makes the final push fail with non-fast-forward).
echo "Resetting dist/ to origin/gh-pages..."
git -C dist fetch origin gh-pages
git -C dist reset --hard origin/gh-pages
git -C dist clean -fdx -e .git

echo "Building..."
npm run build
echo "Build OK."

# Sanity-check build output before committing — a silent build failure that
# emptied dist/ but produced nothing must not be committed.
if [ ! -s dist/index.html ]; then
  echo "ERROR: dist/index.html is missing or empty after build — refusing to deploy."
  exit 1
fi

# Generate version.json
cat > dist/version.json << VEOF
{
  "commit": "$COMMIT_FULL",
  "commitShort": "$COMMIT_SHORT",
  "branch": "$MAIN_BRANCH",
  "buildDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
VEOF

# Bypass Jekyll on GH Pages
touch dist/.nojekyll

git -C dist add -A
if git -C dist diff --cached --quiet; then
  echo "No changes in dist/ — nothing to deploy."
  exit 0
fi
git -C dist commit -m "deploy $COMMIT_SHORT ($COMMIT_FULL)"
git -C dist push

echo "Deployed $COMMIT_SHORT to gh-pages."
