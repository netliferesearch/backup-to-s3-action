class Bucket {
  constructor(options) {
    this.options = options;
	this.bucket = options.Bucket;
    this.client = options.Client;
    this.result = null;
    this.files = false;
  }

  async fetch() {
	const options = { Bucket: this.bucket };
    this.result = await this.client.listObjectsV2(options).promise();
    this.files = this.result.Contents;
  }

  get(key) {
    for (let file of this.files) {
      if (file.Key === key) {
	  // ETag is surrounded by quotes. Remove them.
		file.ETag = file.ETag.replace(/"/g, '');
		return file;
	  }
	}
    return null;
  }

  has(key) {
    for (let file of this.files) {
      if (file.Key === key) return true;
    }
    return false;
  }

  keys() {
	const keys = [];
	for(let file of this.files) {
	  keys.push(file.Key);
	}
	return keys;
  }

  upload(params) {
	return this.client.upload(params).promise();
  }

  deleteObjects(objects) {
	return this.client.deleteObjects({
	  Bucket: this.bucket,
	  Delete: {
		Objects: objects
	  }
	}).promise();
  }
}

exports.Bucket = Bucket;
