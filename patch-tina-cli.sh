#!/bin/sh

echo "Applying workaround for https://github.com/tinacms/tinacms/issues/4492"

[ -e node_modules/@tinacms/cli/dist/index.js ] || echo "Couldn't find node_modules/@tinacms/cli/dist/index.js"

sed -i -E 's/(async loadDatabaseFile\(\) \{)$/\1 return require(this.selfHostedDatabaseFilePath).default;/' node_modules/@tinacms/cli/dist/index.js
