/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'arrangement-visual/automation-clip/control-points',
  'Integration: ArrangementVisualAutomationClipControlPointsComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#arrangement-visual/automation-clip/control-points}}
      //     template content
      //   {{/arrangement-visual/automation-clip/control-points}}
      // `);

      this.render(hbs`{{arrangement-visual/automation-clip/control-points}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
