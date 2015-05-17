import Ember from 'ember';
import Metronome from '/lib/metronome';

export default Ember.ArrayProxy.extend(Ember.SortableMixin, {
  content: null,
  metronome: null,
  play: Ember.computed.alias('metronome.play'),
  isPlaying: Ember.computed.alias('metronome.isPlaying'),
  bpm: Ember.computed.alias('metronome.bpm'),
  numBeats: Ember.computed.alias('metronome.numBeats'),

  // expected params
  bpm: 128.000,
  numBeats: null,

  sortedContent: Ember.computed.sortBy('content', function(x, y) {
    return Ember.compare(x.get('start'), y.get('start'));
  }),

  init: function() {
    this.set('content', this.get('content') || []);
    this.set('metronome', this.get('metronome') || Metronome.create({
      content: this.get('content'),
      bpm: this.get('bpm'),
    }));
  },
});
