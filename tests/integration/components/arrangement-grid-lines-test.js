/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'arrangement-grid-lines',
  'Integration: ArrangementGridLinesComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#arrangement-grid-lines}}
      //     template content
      //   {{/arrangement-grid-lines}}
      // `);

      this.render(hbs`{{arrangement-grid-lines}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
