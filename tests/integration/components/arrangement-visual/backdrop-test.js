/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'arrangement-visual/backdrop',
  'Integration: ArrangementVisualBackdropComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#arrangement-visual/backdrop}}
      //     template content
      //   {{/arrangement-visual/backdrop}}
      // `);

      this.render(hbs`{{arrangement-visual/backdrop}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
