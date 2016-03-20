/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'arrangement-visual/clip/resize-handle',
  'Integration: ArrangementVisualClipResizeHandleComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#arrangement-visual/clip/resize-handle}}
      //     template content
      //   {{/arrangement-visual/clip/resize-handle}}
      // `);

      this.render(hbs`{{arrangement-visual/clip/resize-handle}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
