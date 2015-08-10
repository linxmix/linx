import DS from 'ember-data';
import AbstractListMixin from 'linx/lib/models/abstract-list';

// Model exists solely for testing
export default DS.Model.extend(AbstractListMixin('abstract-list-item'));
