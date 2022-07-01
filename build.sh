#!/usr/bin/env bash
ENVIRONMENT=$1
set -e
npm install -g typescript
npm install -g gulp
curl -sL https://sentry.io/get-cli/ | bash

WEEK=$(date +%V)
YEAR=$(date +%Y)
RELEASE_VERSION=""

if [[ $ENVIRONMENT == "production" ]]
then
    RELEASE_VERSION=$(echo "W$WEEK"".$YEAR"".$BITBUCKET_BUILD_NUMBER")
elif [[ $ENVIRONMENT == "develop" ]]
then
    RELEASE_VERSION=$(echo "Dev-W$WEEK"".$YEAR"".$BITBUCKET_BUILD_NUMBER")
elif [[ $ENVIRONMENT == "pullrequest" ]]
then
    RELEASE_VERSION=$(echo "PR-""$BITBUCKET_PR_ID")
else
    RELEASE_VERSION="WTEST1.0"
fi

sed -i "s/%VERSION%/$RELEASE_VERSION/g" src/environments/*

# Pick the release version number from environment file
tsc ./src/environments/environment.${ENVIRONMENT}.ts
VERSION="$(node -p -e "require('./src/environments/environment.${ENVIRONMENT}').environment.releaseVersion")"

#Printing Version
echo "Releasing Version $VERSION"

# build
npm run build:$ENVIRONMENT

#repack files for better sizes
gulp

#reorganize files
mkdir -p dist/source-map-files
mv dist/convosight-web-client/app/**.map dist/source-map-files

#sentry release
sentry-cli releases new "$VERSION" --finalize
sentry-cli releases files $VERSION upload-sourcemaps ./dist/source-map-files
sentry-cli releases deploys $VERSION new -e $ENVIRONMENT -n $VERSION
