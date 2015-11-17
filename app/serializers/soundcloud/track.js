import ENV from 'linx/config/environment';

import SoundcloudSerializer from '../soundcloud';

export default SoundcloudSerializer.extend({
  normalize(typeClass, hash) {

    // add client_id to stream_url
    if (hash.stream_url) {
      hash.stream_url += `?client_id=${ENV.SC_KEY}`;
    }

    return this._super.apply(this, arguments);
  },
});
