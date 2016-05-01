import Ember from 'ember';

import ENV from 'linx/config/environment';

// S3 file upload service
export default Ember.Service.extend({

  uploadFile(file) {
    Ember.assert('Cannot s3Upload.uploadFile without valid file.{name,type}', Ember.isPresent(file.name) && Ember.isPresent(file.type));

    const fileName = `${getFileNameWithoutExtension(file.name)}-${Date.now()}.${getFileNameExtension(file.name)}`;
    const fileType = file.type;
    console.log('uploadFile', fileName, fileType);

    return this._getSignedRequest(fileName, fileType).then(({ signedRequest }) => {
      return new Ember.RSVP.Promise((resolve, reject) => {
        // TODO: make this use linx/utils/ajax
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedRequest);
        xhr.setRequestHeader('x-amz-acl', 'public-read');
        xhr.onload = () => { resolve(); };
        xhr.send(file);
      });
    });
  },

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
