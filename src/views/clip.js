var Linx = require('../app.js');

module.exports = Linx.module('Tracks.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.ItemView = Marionette.ItemView.extend({
    tagName: 'li',
    template: '#template-clip',

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
      var clipText = this.ui.edit.val().trim();
      if (clipText) {
        this.model.set('name', clipText).save();
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

});