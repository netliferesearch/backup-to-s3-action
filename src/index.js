const S3 = require('aws-sdk/clients/s3');
const async = require('async');
const core = require('@actions/core');
const github = require('@actions/github');
const mime = require('mime-types');
const {Bucket} = require('./classes.js');
const {createReadStream} = require('fs');
const {md5sum, listFiles} = require('./functions.js');
const {cache} = require('./variables.js');
const {resolve} = require('path');
const fs = require("fs");

const s3 = new S3({region: core.getInput('region')});
const source = resolve(core.getInput('source'));

async function main() {
  const params = {
    Bucket: core.getInput('Bucket'),
    ACL: core.getInput('ACL'),
  };

  const q = async.queue(async task => {
    params.Key = task.key;
    params.Body = createReadStream(task.path);
    params.ContentType = mime.lookup(task.path);
    // console.debug('Uploading', params);
    await bucket.upload(params);
  }, core.getInput('concurrent_uploads'));

  const bucket = new Bucket({
    Bucket: core.getInput('Bucket'),
    Client: s3,
  });
  await bucket.fetch();

  /**
   * Assume all keys are to be removed from the bucket.
   * As we loop through the local files, remove them
   * from the purge list.
   *
   * NOTE: The actual purge is only done if 'delete'
   * is set to true.
   */
  cache.purge = bucket.keys();

  for await (const path of listFiles(source)) {
    // remove source from path to form a key
    const key = path.replace(source + '/', '');
    const task = {
      key: key,
      path: path,
    };
    if (bucket.has(key)) {
      // Since key exists. Remove it from the purge list.
      // This reassigns the cache.purge list with the same
      // items except for the one that match the local key.
      cache.purge = cache.purge.filter(remote_key => remote_key !== key);
      const remote_file = bucket.get(key);
      const checksum = await md5sum(path);
      if (remote_file.ETag === checksum) {
        cache.fresh.push(task);
      } else {
        cache.stale.push(task);
      }
    } else {
      cache.miss.push(task);
    }
  }

  if(!fs.existSync("./logs")) {
    fs.mkdirSync("./logs");
  }

  fs.writeFileSync("./logs/aws-s3-sync.json", JSON.stringify(cache));

  console.log(
    'add',
    cache.miss.length,
    cache.miss.map(task => task.key),
  );

  console.log(
    'update',
    cache.stale.length,
    cache.stale.map(task => task.key),
  );

  console.log(
    'keep',
    cache.fresh.length,
    cache.fresh.map(task => task.key),
  );

  if (core.getInput('delete') == 'true') {
    console.log('delete', cache.purge.length, cache.purge);
    if (cache.purge.length > 0) {
      const objects = cache.purge.map(key => ({Key: key}));
      await bucket.deleteObjects(objects);
    }
  } else {
    console.log('remote_only', cache.purge.length, cache.purge);
  }

  q.push([...cache.stale, ...cache.miss]);
}

(async function() {
  if (process.env.DEBUG) {
    console.debug(
      'Concurrent uploads set to',
      core.getInput('concurrent_uploads'),
    );
    console.debug('Delete set to', core.getInput('delete'));
    console.debug('Bucket set to', core.getInput('bucket'));
    console.debug('Region set to', core.getInput('region'));
    console.debug('ACL set to', core.getInput('acl'));
  }
  try {
    await main();
  } catch (e) {
    console.error(e);
    core.setFailed(e.message);
  }
})();
