import Ember from 'ember';
import PreventDirtyTransitionMixin from 'linx/mixins/routes/prevent-dirty-transition';

export default Ember.Route.extend(PreventDirtyTransitionMixin, {

  // TODO: remove hack
  setupController: function(controller, model) {
    this._super.apply(this, arguments);
    controller.set('clip', this.get('store').createRecord('audio-clip', {
      track: model,
      startBeat: 0,
      length: 10000,
    }));
  },

  model: function(params) {
    return this.get('store').find('track', params.id);
  }
});
