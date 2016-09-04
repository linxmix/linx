import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';

// TODO(REFACTOR): can use ic-ajax here?
// Low level ajax request, used where responseType: 'arraybuffer' is needed (which jQuery does not support).
export default Ember.ObjectProxy.extend(
  Ember.PromiseProxyMixin,
  RequireAttributes('url'), {

  // params
  progress: 0,
  promise: null,

  // optional params
  method: 'GET',
  responseType: 'json',
  headers: null,

  // sets promise and sends xhr
  execute(...args) {
    const xhr = this.get('xhr');
    const promise = new Ember.RSVP.Promise((resolve, reject) => {
      xhr.addEventListener('load', (e) => {
        if (this.get('progress') !== 100) {
          this.updateProgress(e);
        }

        if (200 === xhr.status || 206 === xhr.status) {
          resolve(xhr.response);
        } else {
          reject(e);
        }
      });

      xhr.addEventListener('error', reject);
    });

    this.set('promise', promise);
    xhr.send(...args);
    return promise;
  },

  setRequestHeader(...args) {
    return this.get('xhr').setRequestHeader(...args);
  },

  xhr: Ember.computed('url', 'method', 'responseType', function() {
    const { url, method, responseType } = this.getProperties('url', 'method', 'responseType');
    const xhr = new XMLHttpRequest();

    xhr.open(method, url, true);
    xhr.responseType = responseType;

    xhr.addEventListener('progress', (e) => {
      this.updateProgress(e);
    });

    return xhr;
  }),

  updateProgress(e) {
    let percentComplete;

    if (e.lengthComputable) {
      percentComplete = e.loaded / e.total;
    } else {
      // Approximate progress with an asymptotic
      // function, and assume downloads in the 1-3 MB range.
      percentComplete = e.loaded / (e.loaded + 1000000);
    }

    const progress = Math.round(percentComplete * 100);
    this.set('progress', progress);
  },
});
