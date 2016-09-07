import Ember from 'ember';

import { task } from 'ember-concurrency';
import retryWithBackoff from 'ember-backoff/retry-with-backoff';

import ENV from 'linx/config/environment';
import Ajax from 'linx/lib/ajax';
// import ajax from 'ic-ajax';

// S3 file upload service
export default Ember.Service.extend({
  uploadFileTask: task(function * (file) {
    Ember.assert('Cannot s3Upload.uploadFileTask without valid file.{name,type}', Ember.isPresent(file.name) && Ember.isPresent(file.type));

    const fileName = `${getFileNameWithoutExtension(file.name)}-${Date.now()}.${getFileNameExtension(file.name)}`;
    const fileType = file.type;
    // console.log('uploadFile', fileName, fileType);

    const { signedRequest, url } = yield this._getSignedRequest(fileName, fileType);

    return retryWithBackoff(function() {
      const ajax = Ajax.create({
        method: 'put',
        url: signedRequest
      });
      ajax.setRequestHeader('x-amz-acl', 'public-read');

      return ajax.execute(file).then(() => {
        return url;
      });
    }, 5, 200);
  }),

  _getSignedRequest(fileName, fileType) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const url = `${ENV.S3_SIGNATURE_URL}/signed-request`;
      const params = { file: fileName, type: fileType };

      Ember.$.ajax({
        url,
        type: 'post',
        data: params,
        dataType: 'json',
        success: resolve,
        error: reject,
      });
    });
  },
});

function getFileNameWithoutExtension(fileName) {
  return fileName.replace(/\.[^/.]+$/, "");
}

function getFileNameExtension(fileName) {
  return fileName.split('.').pop();
}
