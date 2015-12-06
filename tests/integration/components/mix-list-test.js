/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent.skip(
  'mix-list',
  'Integration: MixListComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#mix-list}}
      //     template content
      //   {{/mix-list}}
      // `);

      this.render(hbs`{{mix-list}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
