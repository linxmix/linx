/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'transition-clip',
  'Integration: TransitionClipComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#transition-clip}}
      //     template content
      //   {{/transition-clip}}
      // `);

      this.render(hbs`{{transition-clip}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
