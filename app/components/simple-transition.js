import Ember from 'ember';
import RequireAttributes from 'linx/lib/require-attributes';

export default Ember.Component.extend(
  RequireAttributes('transition'), {

  classNames: ['SimpleTransition'],

  // params
  arrangement: Ember.computed.alias('transition.arrangement'),
});
