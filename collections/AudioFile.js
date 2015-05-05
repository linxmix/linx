/* global AudioFiles: true */
/* global AudioFileModel: true */
/* global AUDIO_FILES: true */
/* global S3_UPLOADERS: true */


Meteor.startup(function() {
  if (Meteor.isClient) {
    AUDIO_FILES = {
      set: function(_id, file) {
        if (this[_id]) {
          this.destroy(_id);
        }
        this[_id] = new ReactiveVar(file);
      },
      get: function(_id) {
        var file = this[_id];
        return file && file.get();
      },
      destroy: function(_id) {
        delete this[_id];
      }
    };

    S3_UPLOADERS = {
      set: function(_id, uploader) {
        if (this[_id]) {
          this.destroy(_id);
        }
        this[_id] = new ReactiveVar(uploader);
      },
      get: function(_id) {
        var uploader = this[_id];
        return uploader && uploader.get();
      },
      destroy: function(_id) {
        delete this[_id];
      }
    };
  }
});

AudioFileModel = Graviton.Model.extend({
  belongsTo: {
    track: {
      collectionName: 'tracks',
      field: 'trackId',
    },
  },
}, {
  getFile: function() {
    var file = AUDIO_FILES.get(this.get('_id'));
    return file;
  },

  setFile: function(file, options) {
    options = options || {};
    AUDIO_FILES.set(this.get('_id'), file);

    // chain onSuccess
    var fileModel = this;
    options.onSuccess = _.compose(options.onSuccess, function(dataUrl) {
      console.log("setting dataUrl", dataUrl);
      fileModel.set('dataUrl', dataUrl);
      return dataUrl;
    });

    this.readFile(options);
  },

  readFile: function(options) {
    var file = this.getFile();
    if (!file) {
      throw new Error("AudioFile cannot read with no file");
    }

    var onProgress = options.onProgress;
    var onSuccess = options.onSuccess;
    var onError = options.onError;

    // read file
    var reader = new FileReader();
    reader.addEventListener('load', function (e) {
      onSuccess && onSuccess(e.target.result);
    });

    if (onProgress) {
      reader.addEventListener('progress', function (e) {
        var percentComplete;
        if (e.lengthComputable) {
          percentComplete = e.loaded / e.total;
        } else {
          // Approximate progress with an asymptotic
          // function, and assume downloads in the 1-3 MB range.
          percentComplete = e.loaded / (e.loaded + 1000000);
        }

        onProgress(Math.round(percentComplete * 100));;
      });
    }

    reader.addEventListener('error', function (e) {
      console.error('Error reading file: ' + file.name, e);
      alert('Error reading file: ' + file.name, e);
      onError && onError();
    });

    if (options.readAsArrayBuffer) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsDataURL(file);
    }
  },

  calcMD5: function(options) {
    options = options || {};
    options.readAsArrayBuffer = true;

    options.onSuccess = _.compose(options.onSuccess, function(arrayBuffer) {
      return faultylabs.MD5(arrayBuffer);
    });

    this.readFile(options);
  },

  getUploader: function() {
    var uploader = S3_UPLOADERS.get(this.get('_id'));
    if (!uploader) {
      uploader = new Slingshot.Upload("s3FileUpload");
      S3_UPLOADERS.set(this.get('_id'), uploader);
    }
    return uploader;
  },

  upload: function(options) {
    var file = this.getFile();
    
    if (!file) {
      console.error("Error: cannot upload FileModel without audioFile", this.track().get('title'));
    }

    var uploader = this.getUploader();

    // autorun progress
    if (options.onProgress) {
      Tracker.autorun(function(computation) {
        var percent = Math.round(uploader.progress() * 100);
        options.onProgress(percent);
        if (percent === 100) {
          computation.stop();
        }
      });
    }

    uploader.send(file, function (error, downloadUrl) {
      if (error) {
        options.onError && options.onError(error);
        // Log service detailed response
        console.error('Error uploading', error);
        alert(error);
      } else {
        options.onSuccess && options.onSuccess(downloadUrl);
      }
    });
  }
});

AudioFiles = Graviton.define("audiofiles", {
  modelCls: AudioFileModel,
  timestamps: true,
  persist: false,
});
