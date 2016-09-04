import DS from 'ember-data';

import CamelCaseAttributesMixin from 'linx/mixins/serializers/camel-case-attributes';

export default DS.JSONSerializer.extend(CamelCaseAttributesMixin);
