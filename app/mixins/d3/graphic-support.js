import Ember from 'ember';
import GraphicSupport from 'ember-cli-d3/mixins/d3-support';

// Augment ember-cli-d3 GraphicSupport
// Changes to any properties in dependentPaths invoke d3 `call`
export default function(...dependentPaths) {
  const observerName = `_renderD3Selection${dependentPaths.join('')}`;

  return Ember.Mixin.create(GraphicSupport, {
    [observerName]: Ember.observer.apply(Ember, dependentPaths.concat(['isD3Visible', 'transform', function() {
      this.didReceiveAttrs();
    }])),

    // optional params
    // isD3Visible: true,
    // transform: '',

    call(selection) {
      const isD3Visible = this.getWithDefault('isD3Visible', true);

      this._super.apply(this, arguments);
      selection
        .attr('transform', this.getWithDefault('transform', ''))
        .style('visibility', isD3Visible ? 'visible' : 'hidden');
    }
  });
}
