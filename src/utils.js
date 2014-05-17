var utils = {};

utils.isProduction = (process.env.NODE_ENV === 'production');

utils.apiServer = (utils.isProduction ?
 'http://api.linx.dj' : 'http://localhost:5000');

module.exports = utils;