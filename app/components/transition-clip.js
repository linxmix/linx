import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

import Clip from './clip';

export default Clip.extend(
  BubbleActions(), RequireAttributes(), {

  actions: {},
  classNames: ['TransitionClip'],
  classNameBindings: [],

  // params
  foo: 'bar',
});

