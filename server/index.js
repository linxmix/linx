var server = require('./server');

var isProd = (process.env.NODE_ENV === 'production');

server.listen(isProd ? 80 : 5000);

module.exports = server;