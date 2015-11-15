/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'quantize-dropdown',
  'Integration: QuantizeDropdownComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#quantize-dropdown}}
      //     template content
      //   {{/quantize-dropdown}}
      // `);

      this.render(hbs`{{quantize-dropdown}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
