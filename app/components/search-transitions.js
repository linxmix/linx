import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['SearchTransitions'],

  // expected params
  transitions: null,

  // params
  isReady: Ember.computed.bool('transitions'),

  initSearch: function() {
    let transitions = this.get('transitions');

    if (!transitions || !this.$()) { return; }

    let promises = transitions.map((transition) => { return transition.get('fromTrack'); });
    promises = promises.concat(transitions.map((transition) => { return transition.get('toTrack'); }));

    Ember.RSVP.all(promises).then(() => {
      let source = transitions.map(function(transition) {
        return {
          title: transition.get('fromTrack.title'),
          description: transition.get('toTrack.title'),
          transition: transition
        };
      });
      let searchFields = ['fromTrack.title', 'toTrack.title'];

      // setup semantic search module
      // TODO: make this use API?
      this.$('.search').search({
        source: source,
        searchFields: searchFields,
        onSelect: (transitionWrapper) => {
          this.sendAction('action', transitionWrapper.transition);
        }
      });
    });
  }.on('didInsertElement').observes('transitions.[]'),
});
