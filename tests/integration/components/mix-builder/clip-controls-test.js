/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'mix-builder/clip-controls',
  'Integration: MixBuilderClipControlsComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#mix-builder/clip-controls}}
      //     template content
      //   {{/mix-builder/clip-controls}}
      // `);

      this.render(hbs`{{mix-builder/clip-controls}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
