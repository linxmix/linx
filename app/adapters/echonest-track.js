import EchonestAdapter from './echonest';

export default EchonestAdapter.extend({
  // force no cache
  get: function (type, url, data, bucket) {
    return this._super.call(this, type, url, data, bucket, { cache: false });
  },
});
