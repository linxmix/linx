import Ember from 'ember';
import DS from 'ember-data';

import d3 from 'd3';
import AutomationMixin from 'linx/mixins/playable-arrangement/automatable-clip/automation';
import CurveMixin from 'linx/mixins/curve';
import subtract from 'linx/lib/computed/subtract';

export default DS.Model.extend(
  AutomationMixin, {

  controlType: DS.attr('string'),
  transition: DS.belongsTo('transition', { async: true }),

  // implement automation
  startBeat: Ember.computed.reads('transition.mixItem.transitionClip.startBeat'),
  beatCount: Ember.computed.reads('transition.beatCount'),
  curve: Ember.computed('scale', function() {
    const scale = this.get('scale');

    return Ember.Object.extend(CurveMixin).create({
      getPoint(x) {
        return scale(x);
      }
    });
  }),
  // controlPoints: DS.hasMany('arrangement/automation-clip/control-point', { async: true }),

  controlPointSort: ['beat:asc'],
  sortedControlPoints: Ember.computed.sort('controlPoints', 'controlPointSort'),

  firstControlPoint: Ember.computed.reads('sortedControlPoints.firstObject'),
  lastControlPoint: Ember.computed.reads('sortedControlPoints.lastObject'),

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

  scale: Ember.computed('sortedControlPoints.@each.{beat,value}', function() {
    return d3.scale.linear()
      // .interpolate('monotone')
      .domain(this.get('sortedControlPoints').mapBy('beat'))
      .range(this.get('sortedControlPoints').mapBy('value'));
  }),

});
