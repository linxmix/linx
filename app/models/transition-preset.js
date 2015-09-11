import DS from 'ember-data';

import DependentRelationshipMixin from 'linx/mixins/models/dependent-relationship';
import withDefaultModel from 'linx/lib/computed/with-default-model';

export default DS.Model.extend(
  DependentRelationshipMixin('arrangement'), {

  _arrangement: DS.belongsTo('arrangement', { async: true }),
  arrangement: withDefaultModel('_arrangement', function() {
    let arrangement = this.get('store').createRecord('arrangement');
    return arrangement;
  }),
});
