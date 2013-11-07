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

    'onEditClick': function () {
      this.$el.addClass('editing');
      this.ui.edit.focus();
      this.ui.edit.val(this.ui.edit.val());
    },

    'onEditFocusout': function () {
      var sampleText = this.ui.edit.val().trim();
      if (sampleText) {
        this.model.set('name', sampleText).save();
        this.$el.removeClass('editing');
      } else {
        this.destroy();
      }
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

});