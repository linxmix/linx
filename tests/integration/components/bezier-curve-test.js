/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'bezier-curve',
  'Integration: BezierCurveComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#bezier-curve}}
      //     template content
      //   {{/bezier-curve}}
      // `);

      this.render(hbs`{{bezier-curve}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
