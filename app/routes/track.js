import Ember from 'ember';
import PreventDirtyTransitionMixin from 'linx/mixins/routes/prevent-dirty-transition';

export default Ember.Route.extend(PreventDirtyTransitionMixin, {
  model: function(params) {
    return this.get('store').find('track', params.id);
  }
});
