import Ember from 'ember';
import GraphicSupport from 'ember-cli-d3/mixins/d3-support';

// Augment ember-cli-d3 GraphicSupport
export default function(...dependentPaths) {
  const observerName = `_renderD3Selection${dependentPaths.join('')}`;

  return Ember.Mixin.create(GraphicSupport, {
    [observerName]: Ember.observer.apply(Ember, dependentPaths.concat([function() {
      this.didReceiveAttrs();
      // const select = this.get('select');

      // if (select && !this.isDestroying) {
      //   // console.log('SELECTION', select)
      //   Ember.run.once(select, select.call, this);
      // }
    }])),
  });
}
