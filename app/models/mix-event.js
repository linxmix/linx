import DS from 'ember-data';
import AbstractListMixin from 'linx/mixins/models/abstract-list';

// Model exists solely for testing
export default DS.Model.extend(AbstractListMixin('abstract-list-item'));
