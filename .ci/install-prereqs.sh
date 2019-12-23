#!/bin/bash
#
# Copyright Hyperledger Aries contributors. All rights reserved.
#
# SPDX-License-Identifier: Apache-2.0

set -ex
export CC=clang
export CXX=clang++
export npm_config_clang=1
if [[ "$AGENT_OS" == "Linux" ]]; then
    sudo DEBIAN_FRONTEND=noninteractive apt-get -qq install -q \
         --no-install-recommends -y icnsutils graphicsmagick xz-utils
fi
curl -o- -L https://yarnpkg.com/install.sh | bash
npm install -s -g xvfb-maybe
