var Linx = require('../app.js');

module.exports = Linx.module('Samples.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SampleView = Marionette.ItemView.extend({
    'tagName': 'li',
    'template': '#template-sample',

    'ui': {
      'edit': '.edit'
    },

    'events': {
      'click .destroy': 'destroy',
      'click .queue': 'queue',
      'dblclick label': 'onEditClick',
      'keydown .edit': 'onEditKeypress',
      'focusout .edit': 'onEditFocusout',
    },

    'modelEvents': {
      'change': 'render',
    },

    'destroy': function () {
      this.model.destroy();
    },

    'queue': function () {
      App.Tracks.tracker.trackList.create({
        clips: this.model.attributes._id
      });
    },

    'onEditClick': function () {
      this.$el.addClass('editing');
      this.ui.edit.focus();
      this.ui.edit.val(this.ui.edit.val());
    },

    'onEditFocusout': function () {
      var sampleText = this.ui.edit.val().trim();
      this.model.set('name', sampleText).save();
      this.$el.removeClass('editing');
    },

    'onEditKeypress': function (e) {
      var ENTER_KEY = 13, ESC_KEY = 27;

      if (e.which === ENTER_KEY) {
        this.onEditFocusout();
        return;
      }

      if (e.which === ESC_KEY) {
        this.ui.edit.val(this.model.get('name'));
        this.$el.removeClass('editing');
      }
    }
  });

  Views.SampleClipView = Marionette.ItemView.extend({
    'tagName': 'li',
    'template': '#template-sample-clip',
    'modelEvents': {
      'change': 'render',
    },

    'initialize': function () {
      var self = this;
      this.getWave({ 'container': '.wave' }, function (err, wave) {
        if (err) throw err;
        self['wave'] = wave;
      });
    },

    'getWave': function (options, callback) {
      var self = this;

      // get this sample's blob
      this.model.getBlob(function (err, blob) {

        // init our wave
        var wave = Object.create(WaveSurfer);
        wave.init(options);

        // create file reader / load with events
        var reader = new FileReader();
        reader.addEventListener('progress', function (e) {
          wave.onProgress(e);
        });
        reader.addEventListener('load', function (e) {
          wave.loadBuffer(e.target.result);
        });
        reader.addEventListener('error', function (err) {
          throw err;
        });

        if (blob) {
          wave.empty();
          reader.readAsArrayBuffer(blob);
        } else {
          return callback(new Error('no blob given to getWave'));
        }
        return callback(null, wave);
      });
    },

    'events': {
      'click .play-pause': 'onPlayPause',
      'click .stop': 'onStop',
    },

    'onPlayPause': function () {
      this.wave.playPause();
    },

    'onStop': function () {
      this.wave.stop();
    },

  });
});