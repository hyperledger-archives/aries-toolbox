#!/bin/bash
#
# Copyright Hyperledger Aries contributors. All rights reserved.
#
# SPDX-License-Identifier: Apache-2.0

set -ex
yarn

if [[ "$GITHUB_TOKEN" == "" ]]; then
  echo "No GitHub token - not running build step"
else
  yarn run build
fi
