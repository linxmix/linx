var expect = require('chai').expect;
var Backbone = require('backbone');
Backbone.$ = require('jquery');
require('debug').enable('*');

var Track = require('../../src/models/Track');
var Edge = require('../../src/models/Edge');
var Transition = require('../../src/models/Transition');
var Queue = require('../../src/collections/Queue');

describe("#Queue", function () {
  var queue;
  var song0;
  var song1;
  var transition12;
  var transition12Bad;
  var song2;
  var transition23;
  var transition23Bad;
  var song3;
  var tracks;

  beforeEach(function () {
    console.log("RESETTING QUEUE");
    queue = new Queue([], { 'numWidgets': 2, 'id': 1 });
    song0 = new Track({
    'id': 'song0',
    'title': 'song0',
    'linxType': 'song',
    'duration': 10000, // 10 s
    });
    song1 = new Track({
      'id': 'song1',
      'title': 'song1',
      'linxType': 'song',
      'duration': 10000, // 10 s
    });
    transition12 = new Transition({
      'id': 'transition12',
      'title': 'transition12',
      'linxType': 'transition',
      'duration': 5000,
      'edge': new Edge({
        'in': 'song1',
        'edgeId': 'transitions12',
        'out': 'song2',
        'endIn': 9,
        'startEdge': 1,
        'endEdge': 4,
        'startOut': 1,
      }),
    })
    transition12Bad = new Transition({
      'id': 'transition12',
      'title': 'transition12',
      'linxType': 'transition',
      'duration': 5000,
      'edge': new Edge({
        'in': 'song1',
        'edgeId': 'transitions12',
        'out': 'song2',
        'endIn': 9,
        'startEdge': 1,
        'endEdge': 4,
        'startOut': 9, // bad with transition23
      }),
    })
    song2 = new Track({
      'id': 'song2',
      'title': 'song2',
      'linxType': 'song',
      'duration': 20000, // 20 s
    });
    transition23 = new Transition({
      'id': 'transition23',
      'title': 'transition23',
      'linxType': 'transition',
      'duration': 10000,
      'edge': new Edge({
        'in': 'song2',
        'edgeId': 'transitions23',
        'out': 'song3',
        'endIn': 8,
        'startEdge': 5,
        'endEdge': 6,
        'startOut': 2,
      }),
    });
    transition23Bad = new Transition({
      'id': 'transition23',
      'title': 'transition23',
      'linxType': 'transition',
      'duration': 10000,
      'edge': new Edge({
        'in': 'song2',
        'edgeId': 'transitions23',
        'out': 'song3',
        'endIn': 1, // this is bad with transition12
        'startEdge': 5,
        'endEdge': 6,
        'startOut': 2,
      }),
    });
    song3 = new Track({
      'id': 'song3',
      'title': 'song3',
      'linxType': 'song',
      'duration': 30000, // 30 s
    });
    tracks = [song0, song1, transition12, transition12Bad, song2,
      transition23, transition23Bad, song3]
    queue.playlist = 'cid1';
    tracks.forEach(function (track) {
      track.unset(queue.getTimingKey());
    })
  });

  it("should be constructable with options.numWidgets", function () {
    expect(queue).to.exist;
    expect(queue.getWidgets().length).equal(2);
  });

 it("can queue and dequeue tracks in order with timing", function (done) {
    queue.add(song1, { 'at': 0 });
    queue.add(song2, { 'at': 1 });
    expect(queue.length).to.equal(2);

    // expect models
    var model1 = queue.models[0];
    var model2 = queue.models[1];
    expect(model1).to.exist;
    expect(model2).to.exist;
    expect(model1.id).to.equal(song1.id);
    expect(model2.id).to.equal(song2.id);

    // expect timing
    var timing1 = song1.get(queue.getTimingKey());
    var timing2 = song2.get(queue.getTimingKey());
    expect(timing1.startTime).equal(0);
    expect(timing1.endTime).equal(10);
    expect(timing2.startTime).equal(0);
    expect(timing2.endTime).equal(20);

    // expect remove
    queue.remove(song1);
    expect(queue.length).to.equal(1);
    model1 = queue.models[0];
    expect(model1).to.exist;
    expect(model1.id).to.equal(song2.id);
    expect(song1.get(queue.getTimingKey())).not.to.exist;
    setTimeout(done, 1500);
  })

  it("can queue a proper transition mid-queue", function (done) {
    queue.add(song0, { 'at': 0 });
    queue.add(song1, { 'at': 1 });
    queue.add(song2, { 'at': 2 });
    queue.add(transition12, { 'at': 2 });
    expect(queue.length).equal(4);
    expect(queue.models[2].id).equal(transition12.id)
    var timing1 = song1.get(queue.getTimingKey());
    var timing2 = transition12.get(queue.getTimingKey());
    var timing3 = song2.get(queue.getTimingKey());
    expect(timing1.startTime).equal(0)
    expect(timing1.endTime).equal(9)
    expect(timing2.startTime).equal(1)
    expect(timing2.endTime).equal(4)
    expect(timing3.startTime).equal(1)
    expect(timing3.endTime).equal(20)
    setTimeout(done, 1500);
  });

  it("can queue next song with a transition", function (done) {
    
    queue.add(song0, { 'at': 0 });
    queue.add(song1, { 'at': 1 });
    queue.add(transition12, { 'at': 2 });
    expect(queue.length).equal(4);
    expect(queue.models[2].id).equal(transition12.id)
    var timing1 = song1.get(queue.getTimingKey());
    var timing2 = transition12.get(queue.getTimingKey());
    var timing3 = queue.models[3].get(queue.getTimingKey());
    expect(timing1.startTime).equal(0)
    expect(timing1.endTime).equal(9)
    expect(timing2.startTime).equal(1)
    expect(timing2.endTime).equal(4)
    expect(timing3.startTime).equal(1)
    expect(timing3.endTime).equal(15)
    setTimeout(done, 1500);
  });

  it("can queue prev song with a transition", function (done) {
    queue.add(song0, { 'at': 0 });
    queue.add(song2, { 'at': 1 });
    queue.add(transition12, { 'at': 1 });
    expect(queue.length).equal(4);
    expect(queue.models[2].id).equal(transition12.id)
    var timing1 = queue.models[1].get(queue.getTimingKey());
    var timing2 = transition12.get(queue.getTimingKey());
    var timing3 = song2.get(queue.getTimingKey());
    expect(timing1.startTime).equal(0)
    expect(timing1.endTime).equal(9)
    expect(timing2.startTime).equal(1)
    expect(timing2.endTime).equal(4)
    expect(timing3.startTime).equal(1)
    expect(timing3.endTime).equal(20)
    setTimeout(done, 1500);
  });

  it("can queue prev and next songs with a transition", function (done) {
    queue.add(song0, { 'at': 0 });
    queue.add(transition12, { 'at': 1 });
    expect(queue.length).equal(4);
    expect(queue.models[2].id).equal(transition12.id)
    var timing1 = queue.models[1].get(queue.getTimingKey());
    var timing2 = transition12.get(queue.getTimingKey());
    var timing3 = queue.models[3].get(queue.getTimingKey());
    expect(timing1.startTime).equal(0)
    expect(timing1.endTime).equal(9)
    expect(timing2.startTime).equal(1)
    expect(timing2.endTime).equal(4)
    expect(timing3.startTime).equal(1)
    expect(timing3.endTime).equal(15)
    setTimeout(done, 1500);
  });

  it("can queue a transition with a prev transition", function (done) {
    queue.add(song0, { 'at': 0 });
    queue.add(song1, { 'at': 1 });
    queue.add(song2, { 'at': 2 });
    queue.add(song3, { 'at': 3 });
    queue.add(transition12, { 'at': 2 });
    queue.add(transition23, { 'at': 4 });
    expect(queue.length).equal(6);
    expect(queue.models[2].id).equal(transition12.id)
    expect(queue.models[4].id).equal(transition23.id)
    var timing1 = song1.get(queue.getTimingKey());
    var timing2 = transition12.get(queue.getTimingKey());
    var timing3 = song2.get(queue.getTimingKey());
    var timing4 = transition23.get(queue.getTimingKey());
    var timing5 = song3.get(queue.getTimingKey());
    expect(timing1.startTime).equal(0)
    expect(timing1.endTime).equal(9)
    expect(timing2.startTime).equal(1)
    expect(timing2.endTime).equal(4)
    expect(timing3.startTime).equal(1)
    expect(timing3.endTime).equal(8)
    expect(timing4.startTime).equal(5)
    expect(timing4.endTime).equal(6)
    expect(timing5.startTime).equal(2)
    expect(timing5.endTime).equal(30)
    setTimeout(done, 1500);
  });

  it("can queue a transition with a next transition", function (done) {
    queue.add(song0, { 'at': 0 });
    queue.add(song1, { 'at': 1 });
    queue.add(song2, { 'at': 2 });
    queue.add(song3, { 'at': 3 });
    queue.add(transition23, { 'at': 3 });
    queue.add(transition12, { 'at': 2 });
    expect(queue.length).equal(6);
    expect(queue.models[2].id).equal(transition12.id)
    expect(queue.models[4].id).equal(transition23.id)
    var timing1 = song1.get(queue.getTimingKey());
    var timing2 = transition12.get(queue.getTimingKey());
    var timing3 = song2.get(queue.getTimingKey());
    var timing4 = transition23.get(queue.getTimingKey());
    var timing5 = song3.get(queue.getTimingKey());
    expect(timing1.startTime).equal(0)
    expect(timing1.endTime).equal(9)
    expect(timing2.startTime).equal(1)
    expect(timing2.endTime).equal(4)
    expect(timing3.startTime).equal(1)
    expect(timing3.endTime).equal(8)
    expect(timing4.startTime).equal(5)
    expect(timing4.endTime).equal(6)
    expect(timing5.startTime).equal(2)
    expect(timing5.endTime).equal(30)
    setTimeout(done, 1500);
  });
  it("ok when queuing a transition with prev playing", function (done) {
    queue.add(song1, { 'at': 0 });
    queue.add(transition12, { 'at': 1 });
    expect(queue.length).equal(3);
    expect(queue.models[1].id).equal(transition12.id)
    var timing1 = queue.models[0].get(queue.getTimingKey());
    var timing2 = transition12.get(queue.getTimingKey());
    var timing3 = queue.models[2].get(queue.getTimingKey());
    expect(timing1.startTime).equal(0)
    expect(timing1.endTime).equal(9)
    expect(timing2.startTime).equal(1)
    expect(timing2.endTime).equal(4)
    expect(timing3.startTime).equal(1)
    expect(timing3.endTime).equal(15)
    setTimeout(done, 1500);
  });
  it("errors when queuing a transition that overlaps with prev transition", function (done) {
    queue.add(song0, { 'at': 0 });
    queue.add(song1, { 'at': 1 });
    queue.add(song2, { 'at': 2 });
    queue.add(transition12, { 'at': 2 });
    var fn = function () {
      queue.add(transition23Bad, { 'at': 4});
    }
    expect(fn).to.throw(/impossible timing/);
    setTimeout(done, 1500);
  });

  it("errors when queuing a transition that overlaps with next transition", function (done) {
    queue.add(song0, { 'at': 0 });
    queue.add(song1, { 'at': 1 });
    queue.add(song2, { 'at': 2 });
    queue.add(transition23, { 'at': 3 });
    var fn = function () {
      queue.add(transition12Bad, { 'at': 2});
    }
    expect(fn).to.throw(/impossible timing/);
    setTimeout(done, 1500);
  });


  it("kicks out prev transition, then fixes timings", function (done) {
    queue.add(song0, { 'at': 0 });
    queue.add(song1, { 'at': 1 });
    queue.add(song2, { 'at': 2 });
    queue.add(transition12, { 'at': 2 });
    expect(queue.length).equal(4);
    queue.add(song3, { 'at': 3 });
    expect(queue.length).equal(4);
    expect(queue.models[0].id).equal(song0.id)
    expect(queue.models[1].id).equal(song1.id)
    expect(queue.models[2].id).equal(song3.id)
    expect(queue.models[3].id).equal(song2.id)
    var timing1 = song1.get(queue.getTimingKey());
    var timing2 = song3.get(queue.getTimingKey());
    var timing3 = song2.get(queue.getTimingKey());
    expect(timing1.startTime).equal(0)
    expect(timing1.endTime).equal(10)
    expect(timing2.startTime).equal(0)
    expect(timing2.endTime).equal(30)
    expect(timing3.startTime).equal(0)
    expect(timing3.endTime).equal(20)
    setTimeout(done, 1500);
  });


  it("kicks out next transition, then fixes timings", function (done) {
    queue.add(song0, { 'at': 0 });
    queue.add(song1, { 'at': 1 });
    queue.add(song2, { 'at': 2 });
    queue.add(transition12, { 'at': 2 });
    expect(queue.length).equal(4);
    queue.add(song3, { 'at': 2 });
    expect(queue.length).equal(4);
    expect(queue.models[0].id).equal(song0.id)
    expect(queue.models[1].id).equal(song1.id)
    expect(queue.models[2].id).equal(song3.id)
    expect(queue.models[3].id).equal(song2.id)
    var timing1 = song1.get(queue.getTimingKey());
    var timing2 = song3.get(queue.getTimingKey());
    var timing3 = song2.get(queue.getTimingKey());
    expect(timing1.startTime).equal(0)
    expect(timing1.endTime).equal(10)
    expect(timing2.startTime).equal(0)
    expect(timing2.endTime).equal(30)
    expect(timing3.startTime).equal(0)
    expect(timing3.endTime).equal(20)
    setTimeout(done, 1500);
  });

  it("kicks out other transition, then fixes timings", function (done) {
    queue.add(song0, { 'at': 0 });
    queue.add(song1, { 'at': 1 });
    queue.add(song2, { 'at': 2 });
    queue.add(transition12, { 'at': 2 });
    expect(queue.length).equal(4);
    queue.add(transition12Bad, { 'at': 2 });
    expect(queue.length).equal(4);
    expect(queue.models[0].id).equal(song0.id)
    expect(queue.models[1].id).equal(song1.id)
    expect(queue.models[2].id).equal(transition12Bad.id)
    expect(queue.models[3].id).equal(song2.id)
    var timing1 = song1.get(queue.getTimingKey());
    var timing2 = transition12Bad.get(queue.getTimingKey());
    var timing3 = song2.get(queue.getTimingKey());
    expect(timing1.startTime).equal(0)
    expect(timing1.endTime).equal(9)
    expect(timing2.startTime).equal(1)
    expect(timing2.endTime).equal(4)
    expect(timing3.startTime).equal(9)
    expect(timing3.endTime).equal(20)
    setTimeout(done, 1500);
  });

  it("can remove a transition, then fixes timings", function (done) {
    queue.add(song0, { 'at': 0 });
    queue.add(song1, { 'at': 1 });
    queue.add(song2, { 'at': 2 });
    queue.add(transition12, { 'at': 2 });
    expect(queue.length).equal(4);
    queue.remove(transition12);
    expect(queue.length).equal(3);
    expect(queue.models[0].id).equal(song0.id)
    expect(queue.models[1].id).equal(song1.id)
    expect(queue.models[2].id).equal(song2.id)
    var timing1 = song1.get(queue.getTimingKey());
    var timing2 = song2.get(queue.getTimingKey());
    expect(timing1.startTime).equal(0)
    expect(timing1.endTime).equal(10)
    expect(timing2.startTime).equal(0)
    expect(timing2.endTime).equal(20)
    setTimeout(done, 1500);
  });

  it("can remove a song, then removes prev transition, then fixes timings", function (done) {
    queue.add(song0, { 'at': 0 });
    queue.add(song1, { 'at': 1 });
    queue.add(song2, { 'at': 2 });
    queue.add(transition12, { 'at': 2 });
    expect(queue.length).equal(4);
    queue.remove(song2);
    expect(queue.length).equal(2);
    expect(queue.models[0].id).equal(song0.id)
    expect(queue.models[1].id).equal(song1.id)
    var timing1 = song1.get(queue.getTimingKey());
    expect(timing1.startTime).equal(0)
    expect(timing1.endTime).equal(10)
    setTimeout(done, 1500);
  });

  it("can remove a song, then removes next transition, then fixes timings", function (done) {
    queue.add(song0, { 'at': 0 });
    queue.add(song1, { 'at': 1 });
    queue.add(song2, { 'at': 2 });
    queue.add(transition12, { 'at': 2 });
    expect(queue.length).equal(4);
    queue.remove(song1);
    expect(queue.length).equal(2);
    expect(queue.models[0].id).equal(song0.id)
    expect(queue.models[1].id).equal(song2.id)
    var timing1 = song2.get(queue.getTimingKey());
    expect(timing1.startTime).equal(0)
    expect(timing1.endTime).equal(20)
    setTimeout(done, 1500);
  });

  it("can have different timings for different queues", function (done) {
    var queue2 = new Queue([], { 'id': 2 });
    queue2.playlist = 'cid2';
    queue.add(song0, { 'at': 0 });
    queue2.add(song0, { 'at': 0 });
    expect(queue.length).equal(1);
    expect(queue2.length).equal(1);
    var timing1 = song0.get(queue.getTimingKey());
    var timing2 = song0.get(queue2.getTimingKey());
    expect(timing1.startTime).equal(0)
    expect(timing1.endTime).equal(10)
    expect(timing2.startTime).equal(0)
    expect(timing2.endTime).equal(10)
    setTimeout(done, 1500);
  });

  it("can add and remove songs in batches", function (done) {
    queue.add([song0, song1, song2, song3]);
    expect(queue.length).equal(4);
    expect(queue.models[0].id).equal(song0.id);
    expect(queue.models[1].id).equal(song1.id);
    expect(queue.models[2].id).equal(song2.id);
    expect(queue.models[3].id).equal(song3.id);
    queue.remove([song1, song3]);
    expect(queue.length).equal(2);
    expect(queue.models[0].id).equal(song0.id);
    expect(queue.models[1].id).equal(song2.id);
    queue.add([song1, song3]);
    expect(queue.length).equal(4);
    expect(queue.models[0].id).equal(song0.id);
    expect(queue.models[1].id).equal(song2.id);
    expect(queue.models[2].id).equal(song1.id);
    expect(queue.models[3].id).equal(song3.id);
    queue.remove([song0, song1, song2, song3]);
    expect(queue.length).equal(0);
    setTimeout(done, 1500);
  });

  it("can queue transition with songs in batch", function (done) {
    queue.add([song0, song1, transition12, song2]);
    expect(queue.length).equal(4);
    expect(queue.models[0].id).equal(song0.id);
    expect(queue.models[1].id).equal(song1.id);
    expect(queue.models[2].id).equal(transition12.id);
    expect(queue.models[3].id).equal(song2.id);
    setTimeout(done, 1500);
  });

  it("can queue transitions with songs in batch", function (done) {
    queue.add([song0, song1, transition12, song2, transition23, song3]);
    expect(queue.length).equal(6);
    expect(queue.models[0].id).equal(song0.id)
    expect(queue.models[1].id).equal(song1.id)
    expect(queue.models[2].id).equal(transition12.id)
    expect(queue.models[3].id).equal(song2.id)
    expect(queue.models[4].id).equal(transition23.id)
    expect(queue.models[5].id).equal(song3.id)
    var timing1 = queue.models[1].get(queue.getTimingKey());
    var timing2 = queue.models[2].get(queue.getTimingKey());
    var timing3 = queue.models[3].get(queue.getTimingKey());
    var timing4 = queue.models[4].get(queue.getTimingKey());
    var timing5 = queue.models[5].get(queue.getTimingKey());
    expect(timing1.startTime).equal(0)
    expect(timing1.endTime).equal(9)
    expect(timing2.startTime).equal(1)
    expect(timing2.endTime).equal(4)
    expect(timing3.startTime).equal(1)
    expect(timing3.endTime).equal(8)
    expect(timing4.startTime).equal(5)
    expect(timing4.endTime).equal(6)
    expect(timing5.startTime).equal(2)
    expect(timing5.endTime).equal(15)
    setTimeout(done, 1500);
  });

  it("can queue transition without songs in batch", function (done) {
    queue.add([song0, transition12]);
    expect(queue.length).equal(4);
    expect(queue.models[0].id).equal(song0.id);
    expect(queue.models[1].id).equal(song1.id);
    expect(queue.models[2].id).equal(transition12.id);
    expect(queue.models[3].id).equal(song2.id);
    setTimeout(done, 1500);
  });

  it("can queue transitions without songs in batch", function (done) {
    queue.add([song0, transition12, transition23]);
    expect(queue.length).equal(6);
    expect(queue.models[0].id).equal(song0.id)
    expect(queue.models[1].id).equal(song1.id)
    expect(queue.models[2].id).equal(transition12.id)
    expect(queue.models[3].id).equal(song2.id)
    expect(queue.models[4].id).equal(transition23.id)
    expect(queue.models[5].id).equal(song3.id)
    var timing1 = queue.models[1].get(queue.getTimingKey());
    var timing2 = queue.models[2].get(queue.getTimingKey());
    var timing3 = queue.models[3].get(queue.getTimingKey());
    var timing4 = queue.models[4].get(queue.getTimingKey());
    var timing5 = queue.models[5].get(queue.getTimingKey());
    expect(timing1.startTime).equal(0)
    expect(timing1.endTime).equal(9)
    expect(timing2.startTime).equal(1)
    expect(timing2.endTime).equal(4)
    expect(timing3.startTime).equal(1)
    expect(timing3.endTime).equal(8)
    expect(timing4.startTime).equal(5)
    expect(timing4.endTime).equal(6)
    expect(timing5.startTime).equal(2)
    expect(timing5.endTime).equal(15)
    setTimeout(done, 1500);
  });

  it("can queue intermixed songs and transitions in batch to same effect as not in batch", function (done) {
    var queue2 = new Queue([], { 'id': 2 });
    queue.add([song0, transition12, song3, transition23]);
    queue2.add(song0);
    queue2.add(transition12);
    queue2.add(song3);
    queue2.add(transition23);
    expect(queue.length).equal(6);
    expect(queue.length).equal(queue2.length);
    expect(queue.models[0].id).equal(queue2.models[0].id)
    expect(queue.models[1].id).equal(queue2.models[1].id)
    expect(queue.models[2].id).equal(queue2.models[2].id)
    expect(queue.models[3].id).equal(queue2.models[3].id)
    expect(queue.models[4].id).equal(queue2.models[4].id)
    expect(queue.models[5].id).equal(queue2.models[5].id)
    expect(queue.models[0].id).equal(song0.id)
    expect(queue.models[1].id).equal(song1.id)
    expect(queue.models[2].id).equal(transition12.id)
    expect(queue.models[3].id).equal(song2.id)
    expect(queue.models[4].id).equal(song3.id)
    expect(queue.models[5].id).equal(transition23.id)
    var timing1 = queue.models[1].get(queue.getTimingKey());
    var timing2 = queue.models[2].get(queue.getTimingKey());
    var timing3 = queue.models[3].get(queue.getTimingKey());
    var timing4 = queue.models[4].get(queue.getTimingKey());
    var timing5 = queue.models[5].get(queue.getTimingKey());
    var timing12 = queue2.models[1].get(queue2.getTimingKey());
    var timing22 = queue2.models[2].get(queue2.getTimingKey());
    var timing32 = queue2.models[3].get(queue2.getTimingKey());
    var timing42 = queue2.models[4].get(queue2.getTimingKey());
    var timing52 = queue2.models[5].get(queue2.getTimingKey());
    expect(timing1.startTime).equal(timing12.startTime);
    expect(timing1.endTime).equal(timing12.endTime);
    expect(timing2.startTime).equal(timing22.startTime);
    expect(timing2.endTime).equal(timing22.endTime);
    expect(timing3.startTime).equal(timing32.startTime);
    expect(timing3.endTime).equal(timing32.endTime);
    expect(timing4.startTime).equal(timing42.startTime);
    expect(timing4.endTime).equal(timing42.endTime);
    expect(timing5.startTime).equal(timing52.startTime);
    expect(timing5.endTime).equal(timing52.endTime);
    setTimeout(done, 1500);
  });

  it("can decompose 2 songs into a soft transition", function (done) {
    queue.add([song0, song1]);
    var songs = queue.getSongs();
    expect(songs.length).equal(2);
    expect(songs.models[0].id).equal(queue.models[0].id);
    expect(songs.models[1].id).equal(queue.models[1].id);
    var transitions = queue.getTransitions();
    expect(transitions.length).equal(1);
    var transition = transitions.models[0];
    expect(transition.linxType).equal('transition');
    expect(transition.transitionType).equal('soft');
    expect(transition.save()).equal(false);
    expect(transition.getEdgeId()).equal('soft');
    expect(transition.getInId()).equal(song0.id);
    expect(transition.getOutId()).equal(song1.id);
    setTimeout(done, 1500);
  });


});

function printQueue(queue) {
  for (var i = 0; i < queue.length; i++) {
    console.log(queue.models[i].get('id'), i);
  }
}