#!/bin/sh
# Publish site/ to the Cloudflare Pages project "evendraft-au" (https://evendraft-au.pages.dev).
# Uses the Wrangler install in the Evendraft venture folder, logged in to Madhvan's Cloudflare account.
# The project already exists, so never pass --force.
set -e
cd "$(dirname "$0")"
WRANGLER="${WRANGLER:-/Users/deepaksharma/Documents/VENTURES/new-venture/.tools/node_modules/.bin/wrangler}"
"$WRANGLER" pages deploy site --project-name evendraft-au --branch main --commit-dirty=true
