var Linx = require('../app.js');

module.exports = Linx.module('Players.Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.AdvancedTrackView = Views.TrackView.extend({
    'tagName': 'li',
    'template': require('templates')['advancedTrack'],

    'ui': {
      'edit': '.edit'
    },

    'events': {
      'click .destroy': 'destroy',
      'dblclick label': 'onEditClick',
      'keydown .edit': 'onEditKeypress',
      'focusout .edit': 'onEditFocusout',
    },

    'modelEvents': {
      'change:name': 'changeName',
    },

    'regions': {
      'clips': '.trackClips'
    },

    'initialize': function () {
      
      if (typeof this.model.clips === 'string') {
        var clipId = this.model.get('clips');
        this.clipsView = new App.Samples.Views.ClipView({
          'model': App.Library.librarian.library.sampleList.get(clipId)
        });
      }

      // otherwise, if we have an object with clips
      else if (typeof this.model.attributes.clips === 'object') {
        // TODO
      }
    },

    'changeName': function () {
      this.$el.find('#name').text(this.model.attributes.name);
    },

    'onShow': function() {
      if (this.clipsView) {
        this.clips.show(this.clipsView);
      }
    },

    'destroy': function () {
      this.model.destroy();
    },

    'onEditClick': function () {
      this.$el.addClass('editing');
      this.ui.edit.focus();
      this.ui.edit.val(this.ui.edit.val());
    },

    'onEditFocusout': function () {
      var trackText = this.ui.edit.val().trim();
      this.model.set('name', trackText).save();
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
    },
  });
});