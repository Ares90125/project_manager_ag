#!/bin/bash
ENVIRONMENT=$1
BITBUCKET_BUILD_NUMBER=$2
S3_BUCKET_NAME="develop-coverage-assets.convosight.com"
echo "s3://${S3_BUCKET_NAME}/${ENVIRONMENT}/${BITBUCKET_BUILD_NUMBER}/"
aws s3 cp "s3://${S3_BUCKET_NAME}/${ENVIRONMENT}/${BITBUCKET_BUILD_NUMBER}" tempfolder --recursive