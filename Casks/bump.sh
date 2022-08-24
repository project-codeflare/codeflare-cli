#!/usr/bin/env bash

#
# Update ./codeflare.rb to reflect the sha256sums of the latest macOS
# electron builds. This assumes that those builds have already been
# performed, and will fail otherwise.
#

set -e
set -o pipefail

SCRIPTDIR=$(cd $(dirname "$0") && pwd)

x64=$(sha256sum "$SCRIPTDIR"/../dist/electron/CodeFlare-darwin-x64.tar.bz2 | cut -f1 -d' ')
arm64=$(sha256sum "$SCRIPTDIR"/../dist/electron/CodeFlare-darwin-arm64.tar.bz2 | cut -f1 -d' ')

cp "$SCRIPTDIR"/codeflare.rb "$SCRIPTDIR"/codeflare.rb.bak

cat "$SCRIPTDIR"/codeflare.tpl \
    | sed -r "s/{{ version }}/$version/g" \
    | sed -r "s/{{ x64 }}/$x64/g" \
    | sed -r "s/{{ arm64 }}/$arm64/g" \
          > "$SCRIPTDIR"/codeflare.rb
