/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'mix-builder/tracklist/item',
  'Integration: MixBuilderTracklistItemComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#mix-builder/tracklist/item}}
      //     template content
      //   {{/mix-builder/tracklist/item}}
      // `);

      this.render(hbs`{{mix-builder/tracklist/item}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
