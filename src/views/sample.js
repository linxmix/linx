var Linx = require('../app.js');

module.exports = Linx.module('Samples.Views',
  function (Views, App, Backbone, Marionette, $) {

  Views.SampleView = Marionette.ItemView.extend({
    'tagName': 'li',
    'template': require('templates')['sample'],

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

    'initialize': function () {
      if (debug) {
        console.log("initing sample view", this);
        this.on('all', function (e) { console.log("sample view event: ", e); });
      }
    },

    'destroy': function () {
      this.model.destroy();
    },

    'queue': function () {
      this.model.queue();
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

});