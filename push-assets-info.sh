#!/bin/bash
ENVIRONMENT=$1
BITBUCKET_BUILD_NUMBER=$2
S3_BUCKET_NAME="convosight-webclient-landing-page-injection-bucket"
u1=$(find ./dist -name 'main*.js')
u2=$(find ./dist -name 'polyfil*.js')
u3=$(find ./dist -name 'runtime*.js')
u4=$(find ./dist -name 'scripts*.js')
u5=$(find ./dist -name 'styles*.css')
rm fileList.txt
if [[ ${ENVIRONMENT} = "production" ]]
then
echo "convosight.com/app/${u1##*/}" >> fileList.txt
echo "convosight.com/app/${u2##*/}" >> fileList.txt
echo "convosight.com/app/${u3##*/}" >> fileList.txt
echo "convosight.com/app/${u4##*/}" >> fileList.txt
echo "convosight.com/app/${u5##*/}" >> fileList.txt
else
echo "${ENVIRONMENT}.convosight.com/app/${u1##*/}" >> fileList.txt
echo "${ENVIRONMENT}.convosight.com/app/${u2##*/}" >> fileList.txt
echo "${ENVIRONMENT}.convosight.com/app/${u3##*/}" >> fileList.txt
echo "${ENVIRONMENT}.convosight.com/app/${u4##*/}" >> fileList.txt
echo "${ENVIRONMENT}.convosight.com/app/${u5##*/}" >> fileList.txt
fi

echo "s3://${S3_BUCKET_NAME}/${ENVIRONMENT}/fileList-${BITBUCKET_BUILD_NUMBER}.txt"
aws s3 cp fileList.txt "s3://${S3_BUCKET_NAME}/${ENVIRONMENT}/fileList-${BITBUCKET_BUILD_NUMBER}.txt"