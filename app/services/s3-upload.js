import Ember from 'ember';

import { task } from 'ember-concurrency';

import ENV from 'linx/config/environment';

// S3 file upload service
export default Ember.Service.extend({

  uploadFileTask: task(function * (file) {
    Ember.assert('Cannot s3Upload.uploadFileTask without valid file.{name,type}', Ember.isPresent(file.name) && Ember.isPresent(file.type));

    const fileName = `${getFileNameWithoutExtension(file.name)}-${Date.now()}.${getFileNameExtension(file.name)}`;
    const fileType = file.type;
    // console.log('uploadFile', fileName, fileType);

    const { signedRequest, url } = yield this._getSignedRequest(fileName, fileType);

    yield new Ember.RSVP.Promise((resolve, reject) => {
      // TODO(TECHDEBT): make this use linx/utils/ajax
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", signedRequest);
      xhr.setRequestHeader('x-amz-acl', 'public-read');
      xhr.onload = () => { resolve(url); };
      xhr.send(file);
    });

    return url;
  }),

  _getSignedRequest(fileName, fileType) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const url = `${ENV.API_HOST}/signed-request`;
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
