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

  scale: Ember.computed('controlPoints.@each.{beat,value}', function() {
    return scale = d3.scale.linear()
      .x((d) => d.beat)
      .y((d) => d.value)
      .interpolate('monotone')
      .domain(this.get('controlPoints').mapBy('beat'))
      .range(this.get('controlPoints').mapBy('value'));
  }),

  startAutomation: Ember.on('schedule', function() {
    // const startTime = this.getAbsoluteStartTime();
    // const scale = this.get('scale');
    // const targetClip = this.get('targetClip');
    // console.log('startAutomation', startTime, scale, targetClip);

    // if (scale && targetClip) {
    //   const audioParam = null;
    //   const duration = 0;
    //   audioParam.setValueCurveAtTime(scale.ticks(duration), startTime, duration);
    // }

  }),

  audioParam: Ember.computed('targetClip.inputNode', function() {

  }),

  stopAutomation: Ember.on('unschedule', function() {
    // TODO(TRANSITION)
    // audioParam.cancelScheduledValues()
  }),

  controlPointSort: ['beat:asc'],
  sortedControlPoints: Ember.computed.sort('controlPoints', 'controlPointSort'),

  firstControlPoint: Ember.computed.reads('sortedControlPoints.firstObject'),
  lastControlPoint: Ember.computed.reads('sortedControlPoints.lastObject'),
});
