import Ember from 'ember';
import DS from 'ember-data';

import d3 from 'd3';

import PlayableClipMixin from 'linx/mixins/playable-arrangement/clip';
import subtract from 'linx/lib/computed/subtract';

// Clip that controls an automatable of another clip
// TODO(TRANSITION)
export default DS.Model.extend(PlayableClipMixin, {
  componentName: 'automation-clip',

  transition: DS.belongsTo('transition', { async: true }),

  targetClip: Ember.computed.reads('transition.mixItem.fromTrackClip'),

  // implement clip
  // TODO(REFACTOR): startBeat is code smell
  startBeat: Ember.computed.reads('transition.mixItem.transitionClip.startBeat'),
  arrangement: Ember.computed.reads('transition'),

  // TODO(REFACTOR): move rest to automation clip mixin
  beatCount: subtract('lastControlPoint.beat', 'firstControlPoint.beat'),
  controlName: DS.attr('string', { defaultValue: 'volume' }),
  controlPoints: Ember.computed(function() {
    return [
      {
        beat: 0,
        value: 0,
      },
      {
        beat: 4,
        value: 0.5,
      },
      {
        beat: 12,
        value: 0.5,
      },
      {
        beat: 8,
        value: 0.2,
      },
      {
        beat: 16,
        value: 1,
      },
    ];
  }),
  // controlPoints: DS.hasMany('arrangement/automation-clip/control-point', { async: true }),

  scale: Ember.computed('sortedControlPoints.@each.{beat,value}', function() {
    return d3.scale.linear()
      // .interpolate('monotone')
      .domain(this.get('sortedControlPoints').mapBy('beat'))
      .range(this.get('sortedControlPoints').mapBy('value'));
  }),

  // TODO: depend on all these things. accurately cancel and reschedule
  // should audio param store references to the automations...? and manage its own scheduling?
  startAutomation: Ember.on('schedule', function() {
    const startTime = this.getAbsoluteStartTime();
    const scale = this.get('scale');
    const duration = this.get('duration');
    const beatCount = this.get('beatCount');
    const audioParam = this.get('audioParam');

    if (scale && audioParam) {
      const numTicks = 10;
      const values = new Float32Array(numTicks);
      for (let i = 0; i < numTicks; i++) {
        let beat = (i / numTicks) * beatCount;
        values[i] = scale(beat);
      }
      console.log('startAutomation', startTime, duration, values, audioParam);
      audioParam.setValueCurveAtTime(values, startTime, duration);
    }
  }),

  // TODO: cleaner way to reference audio param?
  audioParam: Ember.computed('targetClip.trackGainNode', function() {
    return this.get('targetClip.trackGainNode.gain');
  }),

  stopAutomation: Ember.on('unschedule', function() {
    const audioParam = this.get('audioParam');
    audioParam && audioParam.cancelScheduledValues(0)
  }),

  controlPointSort: ['beat:asc'],
  sortedControlPoints: Ember.computed.sort('controlPoints', 'controlPointSort'),

  firstControlPoint: Ember.computed.reads('sortedControlPoints.firstObject'),
  lastControlPoint: Ember.computed.reads('sortedControlPoints.lastObject'),
});
