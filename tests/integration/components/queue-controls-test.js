/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent.skip(
  'queue-controls',
  'Integration: QueueControlsComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#queue-controls}}
      //     template content
      //   {{/queue-controls}}
      // `);

      this.render(hbs`{{queue-controls}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
