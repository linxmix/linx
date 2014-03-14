var server = require('./server');

var isProd = (process.env.NODE_ENV === 'production');

server.listen(isProd ? 80 : 5000);

var host = process.env.PORT ? '0.0.0.0' : '127.0.0.1';
var port = process.env.PORT || 5001;

var cors_proxy = require('cors-anywhere');
cors_proxy.createServer({
    requireHeader: ['origin'],
    removeHeaders: ['cookie', 'cookie2']
}).listen(port, host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
});

module.exports = server;