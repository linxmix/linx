var Linx = require('../app.js');

module.exports = Linx.module('Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.ItemView = Marionette.ItemView.extend({
    tagName: 'li',
    template: '#template-track',

    ui: {
      edit: '.edit'
    },

    events: {
      'click .destroy': 'destroy',
      'dblclick label': 'onEditClick',
      'keydown .edit': 'onEditKeypress',
      'focusout .edit': 'onEditFocusout',
    },

    modelEvents: {
      'change': 'render',
    },

    destroy: function () {
      this.model.destroy();
    },

    onEditClick: function () {
      this.$el.addClass('editing');
      this.ui.edit.focus();
      this.ui.edit.val(this.ui.edit.val());
    },

    onEditFocusout: function () {
      var trackText = this.ui.edit.val().trim();
      if (trackText) {
        this.model.set('name', trackText).save();
        this.$el.removeClass('editing');
      } else {
        this.destroy();
      }
    },

    onEditKeypress: function (e) {
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

  Views.ListView = Backbone.Marionette.CompositeView.extend({
    template: '#template-trackList',
    itemView: Views.ItemView,
    itemViewContainer: '#track-list',

    events: {
      'click .create': 'create',
    },

    create: function () {
      App.DAW.tracker.trackList.create();
    }
  });

});