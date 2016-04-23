/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'mix-builder/clip-controls/transition',
  'Integration: MixBuilderClipControlsTransitionComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#mix-builder/clip-controls/transition}}
      //     template content
      //   {{/mix-builder/clip-controls/transition}}
      // `);

      this.render(hbs`{{mix-builder/clip-controls/transition}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
