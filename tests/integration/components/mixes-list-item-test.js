/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent.skip(
  'mixes-list-item',
  'Integration: MixesListItemComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#mixes-list-item}}
      //     template content
      //   {{/mixes-list-item}}
      // `);

      this.render(hbs`{{mixes-list-item}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
