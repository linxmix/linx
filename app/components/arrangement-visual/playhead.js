import Ember from 'ember';

import GraphicSupport from 'ember-cli-d3/mixins/d3-support';

import RequireAttributes from 'linx/lib/require-attributes';

// used for cancelAnimationFrame
let playheadAnimationId;

export default Ember.Component.extend(
  GraphicSupport,
  RequireAttributes('arrangement', 'pxPerBeat'), {

  metronome: Ember.computed.reads('arrangement.metronome'),
  selection: Ember.computed.reads('select.selection'),
  playheadSelection: Ember.computed('selection', function() {
    const selection = this.get('selection');
    return selection && selection.append('line').classed('ArrangementVisualPlayhead', true);
  }),

  updatePlayhead() {
    const metronome = this.get('metronome');
    const currentBeat = (metronome && metronome.getCurrentBeat()) || 0;
    const currentPx = currentBeat * this.get('pxPerBeat');
    const playheadSelection = this.get('playheadSelection');

    playheadSelection && playheadSelection
      .attr('transform', `translate(${currentPx})`)
      .attr('y1', 0)
      .attr('y2', this.get('height'))
  },

  call(selection) {
    this.updatePlayhead();
  },

  startPlayheadAnimation: Ember.observer('metronome.{isPlaying,seekBeat}', function() {
    const context = this;
    if (!this.get('metronome')) { return; }

    // uses requestAnimationFrame to animate the arrangement-visual's playhead
    function animatePlayhead() {
      const metronome = context.get('metronome');

      context.updatePlayhead();

      if (metronome.get('isPlaying')) {
        playheadAnimationId = window.requestAnimationFrame(animatePlayhead);
      } else {
        playheadAnimationId = undefined;
      }
    }

    this.stopPlayheadAnimation();
    animatePlayhead();
  }).on('didInsertElement'),

  stopPlayheadAnimation: Ember.on('willDestroyElement', function() {
    window.cancelAnimationFrame(playheadAnimationId);
  }),
});
