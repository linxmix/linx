import Ember from 'ember';

// Concats string properties together separated by new lines.
var concatLines = function(...properties) {
    let getter = function() {
      var self = this;

      return properties.map(function(property) {
        return self.get(property);
      }).filter(function(value) {
        return value;
      }).join('\n\n');
    };

  return Ember.computed.apply(Ember, properties.concat(getter));
};


export default Ember.Mixin.create({
  // Base message used in dialogs
  dirtyTransitionBaseMessage: "You have unsaved changes that will be lost if you leave this page.",

  // Supplemental message used in window.confirm messages
  dirtyTransitionOkCancelSupplemental: "Click Cancel to go back and save or OK to leave this page.",

  // Supplemental message used in beforeunload messages
  dirtyTransitionBeforeunloadSupplemental: "",

  // Route which supplies model that this route should check when transitioning.
  // Defaults to model for current route.
  dirtyTransitionModelForRoute: null,

  setupUnloadHandlers: function() {
    var self = this;
    var beforeunload = function() {
      if (self.modelForDirtyTransition().get('isDirty')) {
        return self.get('dirtyTransitionBeforeunloadMessage');
      }
    };
    this.set('beforeunload', beforeunload);
    $(window).on('beforeunload', beforeunload);
    this._super.apply(this, arguments);
  }.on('activate'),

  removeUnloadHandlers: function() {
    $(window).off('beforeunload', this.get('beforeunload'));
    this._super.apply(this, arguments);
  }.on('deactivate'),

  dirtyTransitionOkCancelMessage: concatLines('dirtyTransitionBaseMessage', 'dirtyTransitionOkCancelSupplemental'),
  dirtyTransitionBeforeunloadMessage: concatLines('dirtyTransitionBaseMessage', 'dirtyTransitionBeforeunloadSupplemental'),

  modelForDirtyTransition: function() {
    var modelForRoute = this.get('dirtyTransitionModelForRoute') || this.get('routeName');
    return this.modelFor(modelForRoute);
  },

  actions: {
    willTransition: function(transition) {
      var model = this.modelForDirtyTransition();

      if (model.get('isDirty') && !confirm(this.get('dirtyTransitionOkCancelMessage'))) {
        transition.abort();
      } else {
        transition.followRedirects().then(function() {
          model.rollback();
        });
        return true;
      }
    }
  }
});
