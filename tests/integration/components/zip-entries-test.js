/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'zip-entries',
  'Integration: ZipEntriesComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#zip-entries}}
      //     template content
      //   {{/zip-entries}}
      // `);

      this.render(hbs`{{zip-entries}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
