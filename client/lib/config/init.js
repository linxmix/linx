//
// init
//
BUFFER_LOAD_SPEED = 1000000; // bytes/sec
Session.set("load_time", 50.0); // safety net for load times
Session.set("offset", { value: 0, time: 0 });
Session.set("queued_transitions", []);
Session.set("nav", 'graphPage');
