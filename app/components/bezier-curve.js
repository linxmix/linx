import Ember from 'ember';

import Bezier from 'npm:bezier-js';

import BubbleActions from 'linx/lib/bubble-actions';
import RequireAttributes from 'linx/lib/require-attributes';

import LxCanvas from './lx-canvas';

export default LxCanvas.extend(
  BubbleActions(), RequireAttributes(), {

  actions: {},
  classNames: ['BezierCurve'],
  classNameBindings: [],

  // TODO: turn into model?
  curve: Ember.computed(function() {
    return new Bezier(150,40 , 80,30 , 105,150);
  }),

  draw: function() {
    let curve = this.get('curve');
    Ember.Logger.log('_drawCurve');
    this.drawCurve(curve);
    this.drawSkeleton(curve);
  }.observes('curve'),

  empty: Ember.K,

  drawCurve(curve, offset = { x: 0, y: 0 }) {
    let { x: ox, y: oy } = offset;
    let pts = curve.points;
    let ctx = this.get('ctx');

    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(pts[0].x + ox, pts[0].y + oy);

    // Quadratic
    if (pts.length === 3) {

      ctx.quadraticCurveTo(
        pts[1].x + ox, pts[1].y + oy,
        pts[2].x + ox, pts[2].y + oy
      );

    // Cubic
    } else if (pts.length === 4) {
      ctx.bezierCurveTo(
        pts[1].x + ox, pts[1].y + oy,
        pts[2].x + ox, pts[2].y + oy,
        pts[3].x + ox, pts[3].y + oy
      );
    }

    ctx.stroke();
    ctx.closePath();
  },

  drawSkeleton(curve, offset = { x: 0, y: 0 }) {
    let pts = curve.points;
    let ctx = this.get('ctx');

    // draw skeleton points
    ctx.strokeStyle = "black";
    this.drawPoints(pts, offset);

    // then draw lines connecting the points
    ctx.strokeStyle = "lightgrey";
    this.drawLine(pts[0], pts[1], offset);

    // Quadratic
    if (pts.length === 3) {
      this.drawLine(pts[1], pts[2], offset);

    // Cubic
    } else if (pts.length === 4) {
      this.drawLine(pts[2], pts[3], offset);
    }
  },
});

