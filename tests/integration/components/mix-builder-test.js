/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent.skip(
  'mix-builder',
  'Integration: MixBuilderComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#mix-builder}}
      //     template content
      //   {{/mix-builder}}
      // `);

      this.render(hbs`{{mix-builder}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
