#! /usr/bin/env bash
#
# This will generate folders and README.md files for protocol messages found
# defined in a root README.
#
# This script expects to find a line like the following:
# ### Protocol Messages
#
# Followed by any number of lines of the pattern:
# - [message-name](#link-to-message-definition)
#
# Followed by a blank line. Here is a complete example:
#
# ### Protocol Messages
# - [invite](#invite-message)
# - [request](#request-message)
# - [response](#response-message)
#
#
# To prevent clobbering data, no files are overwritten if they already exist. To
# override this behavior, set the environment variable CLOBBER to 1, i.e.:
#
# CLOBBER=1 ./generate_doc_folders.sh

set -eou pipefail

function die {
    >&2 echo "Fatal: ${*}"
    exit 1
}

# If not in docs directory, fail
[[ "$(basename "${PWD}")" == "docs" ]] || die "Must be run from docs"

for readme in "$@"; do
    ./scripts/generate_from_readme.awk -v clobber="${CLOBBER:-0}" "${readme}"
done
