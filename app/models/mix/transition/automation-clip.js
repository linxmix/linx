import Ember from 'ember';
import DS from 'ember-data';

import AutomationClip from 'linx/models/arrangement/automation-clip';

import { clamp, isValidNumber } from 'linx/lib/utils';

export default AutomationClip.extend({
  transition: DS.belongsTo('mix/transition'),

  // overrides
  targetClip: DS.belongsTo('mix/track-clip'),

  orderedHasManyItemModelName: 'mix/transition/automation-clip/control-point',
  _controlPoints: DS.hasMany('mix/transition/automation-clip/control-point', { async: true }),

  arrangement: Ember.computed.reads('transition'),
  transitionBeatCount: Ember.computed.reads('transition.beatCount'),

  // transition automation-clip must have controlPoints within transition
  _updateControlPoints: Ember.observer('transitionBeatCount', function() {
    const transitionBeatCount = this.get('transitionBeatCount')
    // Ember.Logger.log('_updateControlPoints', transitionBeatCount);

    if (isValidNumber(transitionBeatCount)) {
      this.get('controlPoints').forEach((controlPoint) => {
        const oldBeat = controlPoint.get('beat');

        let newBeat;
        if (controlPoint.get('isFirstItem')) {
          newBeat = 0;
        } else if (controlPoint.get('isLastItem')) {
          newBeat = transitionBeatCount;
        } else {
          newBeat = clamp(0, oldBeat, transitionBeatCount);
        }

        controlPoint.set('beat', newBeat);
      });
    }
  }).on('init'),
});
