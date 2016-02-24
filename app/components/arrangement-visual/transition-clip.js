import Ember from 'ember';

import RequireAttributes from 'linx/lib/require-attributes';
import { clamp, isNumber } from 'linx/lib/utils';
import Clip from './clip';

export default Clip.extend({
  call(selection) {
    this._super.apply(this, arguments);
    selection.classed('ArrangementVisualTransitionClip', true);
  },
});
