#!/usr/bin/env bash
ENVIRONMENT=$1
npm install --legacy-peer-deps
# build
npm run add-api:$ENVIRONMENT
