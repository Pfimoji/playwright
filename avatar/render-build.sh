#!/usr/bin/env bash
# Fail fast
set -o errexit

# Install dependencies
npm install

# Install playwright with all required system dependencies
npx playwright install --with-deps
