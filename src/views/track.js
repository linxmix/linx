var Linx = require('../app.js');

module.exports = Linx.module('Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.TrackView = Marionette.Layout.extend({
    'tagName': 'li',
    'template': '#template-track',

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
      'clips': '#track-clips'
    },

    'initialize': function () {
      if (typeof this.model.attributes.clips === 'string') {
        var clipId = this.model.attributes.clips;
        this.clipsView = new App.Samples.Views.SampleClipView({
          'model': App.Library.librarian.library.sampleList.get(clipId)
        });
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