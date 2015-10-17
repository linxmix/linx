/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'd3-axis',
  'Integration: D3AxisComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#d3-axis}}
      //     template content
      //   {{/d3-axis}}
      // `);

      this.render(hbs`{{d3-axis}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
