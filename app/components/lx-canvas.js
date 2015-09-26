import Ember from 'ember';
import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

// implements basic canvas component
// provides helper methods drawLine, drawPoint, drawPoints, drawCircle
// requires 'draw()', 'height', 'width'
// TODO: abstract points and lines into objects?
export default Ember.Component.extend(
  BubbleActions(), RequireAttributes('width', 'height'), {

  tagName: 'canvas',

  attributeBindings: ['width', 'height'],

  actions: {},
  classNames: ['LxCanvas'],
  classNameBindings: [],

  // params
  ctx: null,
  width: 300,
  height: 200,

  draw() {
    throw new Error('draw unimplemented');
  },

  empty() {
    this.get('ctx').clearRect(0, 0, this.get('width'), this.get('height'));
  },

  _initCanvas: function() {
    this.set('ctx', this.get('element').getContext('2d'));
    this.draw();
  }.on('didInsertElement'),

  drawLine(p1, p2, offset = { x: 0, y: 0 }) {
    let { x: ox, y: oy } = offset;
    let ctx = this.get('ctx');

    ctx.beginPath();
    ctx.moveTo(p1.x + ox, p1.y + oy);
    ctx.lineTo(p2.x + ox, p2.y + oy);
    ctx.stroke();
    ctx.closePath();
  },

  drawPoint(p, offset = { x: 0, y: 0 }) {
    let { x: ox, y: oy } = offset;
    let ctx = this.get('ctx');

    ctx.beginPath();
    ctx.arc(p.x + ox, p.y + oy, 5, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
  },

  drawPoints(points, offset = { x: 0, y: 0 }) {
    let { x: ox, y: oy } = offset;

    points.forEach((point) => {
      this.drawCircle(point, 3, offset);
    });
  },

  drawCircle(p, r, offset = { x: 0, y: 0 }) {
    let { x: ox, y: oy } = offset;
    let ctx = this.get('ctx');

    ctx.beginPath();
    ctx.arc(p.x + ox, p.y + oy, r, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
  },
});

