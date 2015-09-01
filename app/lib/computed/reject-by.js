import Ember from 'ember';

// nonEmptyItems: rejectBy('items', 'content', undefined)
export default function(listPropertyPath, rejectPropertyPath, rejectValue) {
  return Ember.computed(`${listPropertyPath}.[].${rejectPropertyPath}`, function() {
    return this.get(listPropertyPath).rejectBy(rejectPropertyPath, rejectValue);
  });
}
