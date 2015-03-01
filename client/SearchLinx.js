Template.SearchLinx.rendered = function() {
  // TODO: debug, make reactive
  this.$('.search').search({
    type: 'simple',
    source: Songs.find().fetch(),
    searchFields: [
      'title'
    ],
  });
};

function onSelect(song) {
  var onSelect = this.data.onSelect;
  onSelect && onSelect(song);
}
