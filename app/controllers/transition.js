import Ember from 'ember';

import subtract from 'linx/lib/computed/subtract';

export default Ember.Controller.extend({
  // expected params
  model: null,

  mix: Ember.computed('model', function() {
    let transition = this.get('model');

    return transition && transition.generateMix();
  }),

  fromTrackEndBeat: Ember.computed.reads('model.fromTrackEndBeat'),
  fromTrackFirstBeat: Ember.computed.reads('model.fromTrack.audioMeta.firstBeat'),

  toTrackStartBeat: Ember.computed.reads('model.toTrackStartBeat'),
  toTrackFirstBeat: Ember.computed.reads('model.toTrack.audioMeta.firstBeat'),

  // Hacky stuff to convert <input type="number"> values to numbers
  inputFromTrackEndBeat: subtract('fromTrackEndBeat', 'fromTrackFirstBeat'),
  inputToTrackStartBeat: subtract('toTrackStartBeat', 'toTrackFirstBeat'),
  inputTransitionLength: Ember.computed.reads('model.numBeats'),

  _inputFromTrackEndBeat: function() {
    let value = parseFloat(this.get('inputFromTrackEndBeat'));

    this.get('model.readyPromise').then((transition) => {
      transition.setFromTrackEndBeat(value + this.get('fromTrackFirstBeat'));
    });
  }.observes('inputFromTrackEndBeat'),
  _inputToTrackStartBeat: function() {
    let value = parseFloat(this.get('inputToTrackStartBeat'));

    this.get('model.readyPromise').then((transition) => {
      transition.setToTrackStartBeat(value + this.get('toTrackFirstBeat'));
    });
  }.observes('inputToTrackStartBeat'),
  _inputTransitionLength: function() {
    let value = parseFloat(this.get('inputTransitionLength'));

    this.get('model.readyPromise').then((transition) => {
      transition.get('arrangement.clips.firstObject').set('numBeats', value);
    });
  }.observes('inputTransitionLength'),
  // /hacky stuff
});
