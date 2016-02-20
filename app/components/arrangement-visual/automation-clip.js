import Ember from 'ember';

import _ from 'npm:underscore';

import Clip from './clip';
import { timeToBeat as staticTimeToBeat } from 'linx/lib/utils';

export default Clip.extend({

  // optional params
  pxPerBeat: 5,

  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('ArrangementVisualAutomationClip', true);
  },
});
