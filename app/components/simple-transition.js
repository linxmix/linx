import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';
import ArrangementPlayerMixin from 'linx/mixins/arrangement-player';

export default Ember.Component.extend(ArrangementPlayerMixin,
  RequireAttributes('transition'), {

  actions: {
    seekToClick: function(e, x) {
      console.log('seekToClick', e, x);
    }
  },

  classNames: ['SimpleTransition'],

  // params
  arrangement: Ember.computed.alias('transition.arrangement'),
});
