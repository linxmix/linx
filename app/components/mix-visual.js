import Ember from 'ember';

import InboundActions from 'ember-component-inbound-actions/inbound-actions';

import { variableTernary } from 'linx/lib/computed/ternary';

export default Ember.Component.extend(
  InboundActions, {

  classNames: ['MixVisual'],

  // required params
  mix: null,
  selectedTransition: null,
  selectedClip: null,

  // optional params
  pxPerBeat: variableTernary('hasSelectedClip', 'zoomedPxPerBeat', 'defaultPxPerBeat'),
  defaultPxPerBeat: 1,
  zoomedPxPerBeat: 25,
  rowHeight: 128,

  // params
  arrangementVisualActionReceiver: null,

  actions: {
    zoomToClip(...args) {
      const arrangementVisual = this.get('arrangementVisualActionReceiver');
      arrangementVisual.send.apply(arrangementVisual, ['zoomToClip'].concat(args));
    },
  }
});

