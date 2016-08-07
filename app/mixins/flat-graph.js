import Ember from 'ember';

import _ from 'npm:underscore';

const {
  computed,
  get
} = Ember;

function trimLeadingDots(str) {
  return str.replace(/^\./g, '');
}

function trimAllOuterDots(str) {
  return str.replace(/^\.|\.$/g, '');
}

function propertyNameForPath(...paths) {
  const trimmedPaths = paths.map(trimAllOuterDots);
  return '__' + trimmedPaths.join('-').replace(/\.?@each\.?|\./g, '-');
}

function getDepth(propName) {
  return (propName.match(/\-/g) || []).length;
}

function flatten(items) {
  return items
    .filter((i) => i)
    .reduce((acc, item) => {
      return acc.concat(item.toArray ? item.toArray() : item);
    }, []);
}

function buildMetaObject(path, propName, value) {
  return {
    value,
    meta: {
      isParent: /\.$/.test(path),
      depth: getDepth(propName)
    }
  };
}

function getValueOrValues(value, transformFn) {
  if (value && value.toArray) {
    const values = _.compact(value.toArray());
    return transformFn ?  values.map(transformFn) : values;
  } else if (value) {
    return transformFn ? transformFn(value) : value;
  }
}

//  Creates an Ember.Object with an `flatGraphAll` property that concatenates the given
//  relationships. Useful when you want to flatten a graph of objects for saving
//  or dirty tracking. Also useful if you need to flatten a graph to avoid
//  Ember's lack of support for nested dependent properties under a `@each`.
//  Also provides `flatGraphAllWithMeta`, which provides information about the item's
//  depth in the graph as well as whether the item is a parent on which other items depend.
//  In the graphDescriptions array, the dot at the end of `unit.` indicates that `unit`
//  is a parent model and has dependent relationships.
//
//  Example:
//
//      const DirtyGraph = FlatGraph([
//        'parent.',
//        'parent.children.@each.grandChildren'
//      ]).extend({
//        isDirty: Ember.computed('all.@each.hasDirtyAttributes', function() {
//          return !!this.get('flatGraphAll').findBy('hasDirtyAttributes');
//        })
//      })
//
//      const dirtyGraph = DirtyGraph.create({ parent });
//
//      dirtyGraph.get('isDirty'); // => false
//
//      parent.set('children.firstObject.grandChildren.firstObject.name', 'Will');
//
//      dirtyGraph.get('isDirty'); // => true
//
//

function flatGraphProperties(graphDescriptions) {
  const base = graphDescriptions.reduce((acc, path) => {
    const parts = path.split('@each').map(trimLeadingDots);

    parts.forEach((originalPath, index, parts) => {
      const trimmedPath = trimAllOuterDots(originalPath);

      if (index === 0) {
        const propName = propertyNameForPath(originalPath);
        const buildMetaObjectFn = buildMetaObject.bind(null, originalPath, propName);

        acc[propName] = computed(trimmedPath, function(){
          return getValueOrValues(this.get(trimmedPath));
        });

        acc[`${propName}__meta`] = computed(propName, function() {
          return getValueOrValues(this.get(propName), buildMetaObjectFn);
        });
      } else {
        const dependentProp = propertyNameForPath(...parts.slice(0, index));
        const propName = propertyNameForPath(...parts.slice(0, index + 1));
        const buildMetaObjectFn = buildMetaObject.bind(null, originalPath, propName);

        acc[propName] = computed(`${dependentProp}.@each.${trimmedPath}`, function() {
          const items = this.get(dependentProp) || [];
          return _.compact(flatten(items.map((item) => get(item, trimmedPath))));
        });

        acc[`${propName}__meta`] = computed(propName, function() {
          return getValueOrValues(this.get(propName), buildMetaObjectFn);
        });
      }
    });

    return acc;
  }, {});

  const allProps = graphDescriptions.map((path) => propertyNameForPath(path));

  base.flatGraphAll = computed.apply(null, allProps.concat(function() {
    return flatten(allProps.map((prop) => this.get(prop)));
  }));

  base.flatGraphAllWithMeta = computed.apply(null, allProps.concat(function() {
    return flatten(allProps.map((prop) => this.get(`${prop}__meta`)));
  }));

  return base;
}

export default function(graphDescriptions) {
  return Ember.Mixin.create(flatGraphProperties(graphDescriptions));
}
