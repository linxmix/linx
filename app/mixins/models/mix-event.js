import Ember from 'ember';
import DS from 'ember-data';

import RequireAttributes from 'linx/lib/require-attributes';
import withDefault from 'linx/lib/computed/with-default';
import withDefaultModel from 'linx/lib/computed/with-default-model';
import { variableTernary } from 'linx/lib/computed/ternary';

export default function(modelName) {
  let eventModelName = `${modelName}-mix-event`;
  let clipModelName = `${modelName}-mix-clip`;

  let mixinParams = {
    type: eventModelName,

    // overridable properties
    isValid: true,
    tracks: Ember.computed(() => { return []; }),

    // helpful methods
    setModel(model) {
      return this.get('clip').then((clip) => {
        clip.set(modelName, model);
        return clip.save();
      });
    },

    // helpful properties
    prevClip: Ember.computed.reads('prevEvent.clip'),
    nextClip: Ember.computed.reads('nextEvent.clip'),

    mix: DS.belongsTo('mix', { async: true }),

    _clip: DS.belongsTo(clipModelName, { async: true }),
    clip: withDefaultModel('_clip', function() {
      return this.get('store').createRecord(clipModelName);
    }),

    firstTrack: Ember.computed.reads('tracks.firstObject'),
    lastTrack: Ember.computed.reads('tracks.lastObject'),

    // overlap with prevEvent if is transition
    defaultStartBeat: withDefault('prevEvent.endBeat', 0),
    startBeat: variableTernary('prevEvent.isValidTransition', 'prevEvent.startBeat', 'defaultStartBeat'),
  };

  // TODO(REQUIREPROPERTIES)
  // return Ember.Mixin.create(RequireAttributes('startBeat', 'type'), mixinParams);
  return Ember.Mixin.create(mixinParams);
}
