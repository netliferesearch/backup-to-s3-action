const cache = {
  /**
   * Miss: Local file is not found in the bucket.
   * Reason: Likely a new file.
   */
  miss: [],
  /**
   * Stale: Cache exists but isn't fresh. Md5sums doesn't match.
   * Reason: Likely an outdated cache file.
   */
  stale: [],
  /**
   * Purge: File exists in bucket not locally.
   * Reason: Likely a deleted file.
   */
  purge: [],
  /**
   * Fresh: File is up to date. Matching md5sums.
   */
  fresh: [],
};

exports.cache = cache;
