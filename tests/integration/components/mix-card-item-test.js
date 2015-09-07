/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'mix-card-item',
  'Integration: MixCardItemComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#mix-card-item}}
      //     template content
      //   {{/mix-card-item}}
      // `);

      this.render(hbs`{{mix-card-item}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
