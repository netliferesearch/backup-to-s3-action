const crypto = require('crypto');
const {createReadStream} = require('fs');
const {readdir} = require('fs').promises;
const {resolve} = require('path');

async function* listFiles(dir) {
  const dirents = await readdir(dir, {withFileTypes: true});
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* listFiles(res);
    } else {
      yield res;
    }
  }
}

exports.listFiles = listFiles;

function md5sum(path) {
  return new Promise((resolve, reject) => {
    const fd = createReadStream(path);
    const hash = crypto.createHash('md5');
    hash.setEncoding('hex');
    fd.on('end', function() {
      hash.end();
      resolve(hash.read());
    });
	fd.pipe(hash);
  });
}

exports.md5sum = md5sum;
