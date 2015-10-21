#!/bin/bash
cd $(dirname $0)
function die() {
	echo $*
	exit 1
}
node test-flexible-format.js || die "test-flexible-format.js failed"
node test-regex.js || die "test-regex.js failed"
node test-rewrite-flags.js || die "test-rewrite-flags.js failed"


