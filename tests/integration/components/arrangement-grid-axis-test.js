/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'arrangement-grid-axis',
  'Integration: ArrangementGridAxisComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#arrangement-grid-axis}}
      //     template content
      //   {{/arrangement-grid-axis}}
      // `);

      this.render(hbs`{{arrangement-grid-axis}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
