/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'arrangement-visual/playhead',
  'Integration: ArrangementVisualPlayheadComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#arrangement-visual/playhead}}
      //     template content
      //   {{/arrangement-visual/playhead}}
      // `);

      this.render(hbs`{{arrangement-visual/playhead}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
