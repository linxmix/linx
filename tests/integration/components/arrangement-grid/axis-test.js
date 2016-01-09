/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent.skip(
  'arrangement-visual/axis',
  'Integration: ArrangementVisualAxisComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#arrangement-visual/axis}}
      //     template content
      //   {{/arrangement-visual/axis}}
      // `);

      this.render(hbs`{{arrangement-visual/axis}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
