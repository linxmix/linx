import d3 from 'd3';

var states = [ 'California', 'Texas', 'New York', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'New Jersey', 'North Carolina', 'Georgia', 'Virginia', 'Massachusetts', 'Michigan', 'Washington', 'Maryland', 'Indiana', 'Minnesota', 'Colorado', 'Tennessee', 'Wisconsin', 'Arizona', 'Missouri', 'Connecticut', 'Louisiana', 'Oregon', 'Alabama', 'Oklahoma', 'South Carolina', 'Kentucky', 'Iowa', 'Kansas', 'Utah', 'Nevada', 'Arkansas', 'Nebraska', 'Mississippi', 'District of Columbia', 'New Mexico', 'Hawaii', 'West Virginia', 'New Hampshire', 'Idaho', 'Delaware', 'North Dakota', 'Alaska', 'Maine', 'South Dakota', 'Wyoming', 'Rhode Island', 'Montana', 'Vermont' ];

// TODO(D3): wtf?

export function randomInt() {
  return Math.floor(Date.now() * Math.random());
}

export function dimensional(series, count = 8, options = {}) {
  var generator = d3.random.normal(options.mean || 2000, options.stddev || 2000);

  return d3.range(count).map(id => {
    var base = { id, state: states[id], timestamp: new Date(id * 3.15569e10 * 2) };

    series.forEach(series => {
      base[series] = generator();
    });

    return base;
  });
}
