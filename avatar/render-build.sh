#!/usr/bin/env bash
set -o errexit

# Install Node dependencies
npm install

# Install only Chromium (not all browsers, smaller + safer)
npx playwright install chromium
