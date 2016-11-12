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
  beatCount: Ember.computed.reads('transition.beatCount'),

  // transition automation-clip must have controlPoints within transition
  _beatCountDidChange: Ember.observer('beatCount', function() {
    Ember.run.once(this, '_updateControlPoints');
  }).on('init'),

  _updateControlPoints() {
    const beatCount = this.get('beatCount');
    // Ember.Logger.log('_updateControlPoints', beatCount);

    if (isValidNumber(beatCount)) {
      const controlPoints = this.get('controlPoints');

      controlPoints.forEach((controlPoint, i) => {
        if (controlPoint.get('isLoading') || controlPoints.get('isSaving')) { return; }
        const oldBeat = controlPoint.get('beat');

        let newBeat;
        if (i === 0) {
          newBeat = 0;
        } else if (i === (controlPoints.get('length') - 1)) {
          newBeat = beatCount;
        } else {
          newBeat = clamp(0, oldBeat, beatCount);
        }

        controlPoint.set('beat', newBeat);
      });
    }
  },
});
