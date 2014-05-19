var utils = {};

utils.isProduction = (process.env.NODE_ENV === 'production');

module.exports = utils;