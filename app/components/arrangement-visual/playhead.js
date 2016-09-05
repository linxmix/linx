import Ember from 'ember';

import GraphicSupport from 'linx/mixins/d3/graphic-support';

import RequireAttributes from 'linx/lib/require-attributes';


export default Ember.Component.extend(
  GraphicSupport(),
  RequireAttributes('arrangement', 'pxPerBeat'), {

  // required params
  arrangement: null,
  pxPerBeat: 20,

  // optional params
  followPlayhead: false,
  centerView: Ember.K,

  metronome: Ember.computed.reads('arrangement.metronome'),
  selection: Ember.computed.reads('select.selection'),
  playheadSelection: Ember.computed('selection', function() {
    const selection = this.get('selection');
    return selection && selection.append('line')
      .classed('ArrangementVisualPlayhead', true)
      .classed('ArrangementVisual-playhead', true);
  }),

  // used for cancelAnimationFrame
  _playheadAnimationId: null,

  updatePlayhead() {
    const metronome = this.get('metronome');
    const currentBeat = (metronome && metronome.getCurrentBeat()) || 0;
    const currentPx = currentBeat * this.get('pxPerBeat');
    const playheadSelection = this.get('playheadSelection');

    playheadSelection && playheadSelection
      .attr('transform', `translate(${currentPx})`)
      .attr('y1', 0)
      .attr('y2', this.get('height'))

    if (this.get('followPlayhead')) {
      this.centerView(false);
    }
  },

  call(selection) {
    this._super.apply(this, arguments);
    this.updatePlayhead();
  },

  startPlayheadAnimation: Ember.observer('metronome.{isPlaying,seekBeat}', function() {
    const context = this;
    if (!this.get('metronome')) { return; }

    // uses requestAnimationFrame to animate the arrangement-visual's playhead
    function animatePlayhead() {
      const metronome = context.get('metronome');

      context.updatePlayhead();

      context.set('_playheadAnimationId',
        metronome.get('isPlaying') ? window.requestAnimationFrame(animatePlayhead) : undefined);
    }

    this.stopPlayheadAnimation();
    animatePlayhead();
  }).on('didInsertElement'),

  stopPlayheadAnimation: Ember.on('willDestroyElement', function() {
    window.cancelAnimationFrame(this.get('_playheadAnimationId'));
  }),
});
