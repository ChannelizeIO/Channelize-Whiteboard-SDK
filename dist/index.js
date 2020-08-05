'use strict';

require('@babel/polyfill');

var _converter = require('./converter');

module.exports = {
  convert: _converter.convert,
};
