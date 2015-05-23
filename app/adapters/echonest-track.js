import EchonestAdapter from './echonest';

export default EchonestAdapter.extend({
  // force no cache
  get: function (type, url, data, bucket) {
    data = Ember.merge({
      api_key: this.api_key,
      format: 'json',
      bucket: bucket || type.proto().bucket
    }, data);

    return this.ajax({
      url: url,
      data: data,
      traditional: true,
      cache: false
    });
  },
});
