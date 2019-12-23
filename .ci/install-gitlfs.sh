#!/bin/bash
#
# Copyright Hyperledger Aries contributors. All rights reserved.
#
# SPDX-License-Identifier: Apache-2.0

set -ex
export GIT_LFS_DIR=~/.git-lfs-ci
mkdir -p $GIT_LFS_DIR

if [[ "$AGENT_OS" == "Linux" ]]; then
  curl -L https://github.com/git-lfs/git-lfs/releases/download/v2.9.2/git-lfs-linux-amd64-v2.9.2.tar.gz | \
    tar -xz -C $GIT_LFS_DIR
elif [[ "$AGENT_OS" == "Darwin" ]]; then
  curl -L https://github.com/git-lfs/git-lfs/releases/download/v2.9.2/git-lfs-darwin-amd64-v2.9.2.tar.gz | \
    tar -xz -C $GIT_LFS_DIR
else
  echo "Unsupported OS"
  exit -1
fi

$GIT_LFS_DIR/git-lfs pull
