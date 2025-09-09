#!/usr/bin/env bash
set -e

echo "Installing dependencies..."
npm install

echo "Installing Playwright browsers..."
npx playwright install

chmod +x render-build.sh
