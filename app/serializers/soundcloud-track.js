import DS from 'ember-data';

import ENV from 'linx/config/environment';

import CamelCaseAttributesMixin from 'linx/mixins/serializers/camel-case-attributes';

export default DS.JSONSerializer.extend(CamelCaseAttributesMixin, {
  normalize(typeClass, hash) {

    // add client_id to stream_url
    if (hash.stream_url) {
      hash.stream_url += `?client_id=${ENV.SC_KEY}`;
    }

    return this._super.apply(this, arguments);
  },
});
