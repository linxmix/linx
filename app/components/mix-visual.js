import Ember from 'ember';

import InboundActions from 'ember-component-inbound-actions/inbound-actions';

import { variableTernary } from 'linx/lib/computed/ternary';

export default Ember.Component.extend(
  InboundActions, {

  classNames: ['MixVisual'],
  classNameBindings: ['selectedTransition:MixVisual--precision'],

  // required params
  mix: null,
  selectedTransition: null,
  selectedClip: null,

  // optional params
  pxPerBeat: variableTernary('selectedTransition', 'zoomedPxPerBeat', 'defaultPxPerBeat'),
  defaultPxPerBeat: 1,
  zoomedPxPerBeat: 25,
  rowHeight: 128,
  showAutomation: false,

  _measureVisual: Ember.observer('selectedTransition', function() {
    Ember.run.next(() => {
      this.get('arrangementVisualActionReceiver').send('measure');
    });
  }),

  // params
  arrangementVisualActionReceiver: null,

  actions: {
    zoomToClip(...args) {
      const arrangementVisual = this.get('arrangementVisualActionReceiver');
      arrangementVisual.send.apply(arrangementVisual, ['zoomToClip'].concat(args));
    },

    resetZoom(...args) {
      const arrangementVisual = this.get('arrangementVisualActionReceiver');
      arrangementVisual.send.apply(arrangementVisual, ['resetZoom'].concat(args));
    },
  }
});

