import EchonestAdapter from '../echonest';

export default EchonestAdapter.extend({
  // force no cache
  getAjax: function (type, url, data, bucket) {
    return this._super.call(this, type, url, data, bucket, { cache: false });
  },
});
