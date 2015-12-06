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

  // sets promise and sends xhr
  execute() {
    let xhr = this.get('xhr');
    let promise = Ember.RSVP.Promise.create((resolve, reject) => {
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
    xhr.send();
    return promise;
  },

  xhr: Ember.computed('url', 'method', 'responseType', function() {
    let { url, method, responseType } = this.getProperties('url', 'method', 'responseType');
    let xhr = new XMLHttpRequest();

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

    this.set('progress', Math.round(percentComplete * 100), e.target);
  },
});
