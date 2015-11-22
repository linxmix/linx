import Ember from 'ember';
import DS from 'ember-data';

import Clip from './clip';
import ArrangementClipMixin from 'linx/mixins/playable-arrangement/arrangement-clip';

export default Clip.extend(
  ArrangementClipMixin, {

  // implement arrangement-clip
  nestedArrangement: DS.belongsTo('arrangement', { async: true, inverse: null }),
});
