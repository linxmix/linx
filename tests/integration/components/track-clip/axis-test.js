/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent.skip(
  'track-clip/axis',
  'Integration: TrackClipAxisComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#track-clip/axis}}
      //     template content
      //   {{/track-clip/axis}}
      // `);

      this.render(hbs`{{track-clip/axis}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
