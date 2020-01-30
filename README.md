# Github Action to sync files with S3

Upload new and modified files. Delete deleted files. Written in JavaScript for faster job setup compared to docker image.

### Usage

```
name: CI

on:
  push:
    branches:
      - master

jobs:
  build-deploy:
    runs-on: ubuntu-18.04
    steps:
      - uses: actions/checkout@v1
      - name: Deploy
        uses: domolicious/s3-sync-js-action@master
        with:
          region: "us-east-1"
          bucket: ${{ secrets.AWS_S3_BUCKET }}
          source: "public"
          concurrent_uploads: 5
          acl: "public-read" # defaults to private
          delete: true # defaults to false
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Configuration

|Name|Description|Type|Default|Required|
|----|-----------|----|-------|--------|
|region|AWS region|with|us-east-1|no|
|bucket|AWS bucket|with||**yes**|
|source|Local directory for sync|with|public|no|
|concurrent_uploads|Number of concurrent uploads|with|5|no|
|acl|ACL for uploaded files. Valid values are private, public-read, public-read-write, authenticated-read, aws-exec-read, bucket-owner-read, bucket-owner-full-control |with|private|no|
|delete|Delete files that only exists in the bucket|with|false|no|
|AWS_ACCESS_KEY_ID|AWS Access Key ID|env||**yes**|
|AWS_SECRET_ACCESS_KEY|AWS Secret Access Key|env||**yes**|
