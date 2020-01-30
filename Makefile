build:
	npx ncc build src/index.js

run:
	DEBUG=true INPUT_DELETE=true INPUT_CONCURRENT_UPLOADS=5 INPUT_CONTENTTYPE=text/html INPUT_ACL=public-read INPUT_BUCKET=magnustestarhugo INPUT_SOURCE=~/hugo/first/public INPUT_REGION=eu-north-1 node src/index.js
