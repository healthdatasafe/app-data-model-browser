#!/bin/sh
# Setup script for app-data-model-browser.

scriptsFolder=$(cd $(dirname "$0"); pwd)
cd $scriptsFolder/..

hash git 2>&- || { echo >&2 "I require git."; exit 1; }
hash npm 2>&- || { echo >&2 "I require node and npm."; exit 1; }

echo "Installing Node modules..."
npm install

if [ ! -d dist/.git ]; then
  echo "Setting up 'dist' folder for publishing to GitHub Pages..."
  rm -rf dist
  git clone -b gh-pages git@github.com:healthdatasafe/app-data-model-browser.git dist || {
    echo "WARNING: Could not clone gh-pages branch. It may not exist yet."
    echo "         Create it on GitHub (or push an empty commit on a 'gh-pages' branch)"
    echo "         then re-run 'npm run setup'."
  }
fi

SETUP_DEV_ENV="./scripts/setup-dev-env.sh"
if [ -f "$SETUP_DEV_ENV" ]; then
  sh "$SETUP_DEV_ENV"
fi

echo "Setup complete."
