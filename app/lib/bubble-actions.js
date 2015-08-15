// Creates a mixin which allows components to specify actions to bubble through
// Note this mixin does NOT support side-effects, or augmenting arguments. These actions are explicitly pass-through
// Usage:

// import BubbleActions from ‘/lib/utils/bubble-actions`;

// export default Ember.Component.extend(
//   BubbleActions('saveModel', 'closeModal'), {
//   ...
// });

import Ember from 'ember';

export default function(...actions) {
  var actionsHash = actions.reduce((actionsHash, actionName) => {
    actionsHash[actionName] = function(...actionArgs) {
      this.sendAction.apply(this, [actionName].concat(actionArgs));
    };
    return actionsHash;
  }, {});

  return Ember.Mixin.create({
    actions: actionsHash,
  });
}
