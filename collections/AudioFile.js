/* global AudioFiles: true */
/* global AudioFileModel: true */
/* global AUDIOFILES: true */


Meteor.startup(function() {
  if (Meteor.isClient) {
    AUDIOFILES = {
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
  }
});

AudioFileModel = Graviton.Model.extend({
  belongsTo: {
    track: {
      collectionName: 'tracks',
      field: 'trackId',
    },
  }
}, {
  getFile: function() {
    var file = AUDIOFILES.get(this.get('_id'));
    return file;
  },

  setFile: function(file) {
    AudioFiles.set(this.get('_id'), file);
  },
});

AudioFiles = Graviton.define("audiofiles", {
  modelCls: AudioFileModel,
  timestamps: true,
  persist: false,
});
