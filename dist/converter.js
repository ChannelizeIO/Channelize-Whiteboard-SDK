'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.convert = convert;

var _fs = require('fs');

var _child_process = require('child_process');

var _lodash = require('lodash');

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function() {
    var self = this,
      args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'next', value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'throw', err);
      }
      _next(undefined);
    });
  };
}

function convert(_x, _x2) {
  return _convert.apply(this, arguments);
}

function _convert() {
  _convert = _asyncToGenerator(
    /*#__PURE__*/ regeneratorRuntime.mark(function _callee(inputPath, option) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch ((_context.prev = _context.next)) {
            case 0:
              if ((0, _fs.existsSync)(inputPath)) {
                _context.next = 2;
                break;
              }

              throw new Error(
                'Make sure the source file exist. '.concat(inputPath),
              );

            case 2:
              if (
                !(
                  (0, _lodash.isObject)(option) &&
                  (option.output || option.buffer)
                )
              ) {
                _context.next = 16;
                break;
              }

              option.format = option.format || 'pdf';

              if (!(0, _lodash.isString)(option.output)) {
                _context.next = 10;
                break;
              }

              _context.next = 7;
              return convertDirectly(inputPath, option);

            case 7:
              return _context.abrupt('return', _context.sent);

            case 10:
              if (!option.buffer) {
                _context.next = 14;
                break;
              }

              _context.next = 13;
              return convertToBuffer(inputPath, option);

            case 13:
              return _context.abrupt('return', _context.sent);

            case 14:
              _context.next = 20;
              break;

            case 16:
              if (!(0, _lodash.isString)(option)) {
                _context.next = 20;
                break;
              }

              _context.next = 19;
              return convertDirectly(inputPath, {
                output: option,
                format: 'pdf',
              });

            case 19:
              return _context.abrupt('return', _context.sent);

            case 20:
              throw new Error('Please read README and pass correct params');

            case 21:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee);
    }),
  );
  return _convert.apply(this, arguments);
}

function convertToBuffer(input, option) {
  return new Promise(function(resolve, reject) {
    var stdout = [];
    var stderr = [];
    var unoconv = (0, _child_process.spawn)('unoconv', [
      '-f',
      option.format,
      '--stdout',
      input,
    ]);
    unoconv.on('error', function(err) {
      if (err.message.indexOf('ENOENT') > -1) {
        console.error('unoconv command not found');
      }

      return reject(err);
    });
    unoconv.stdout.on('data', function(data) {
      stdout.push(data);
    });
    unoconv.stderr.on('data', function(data) {
      stderr.push(data);
    });
    unoconv.on('close', function(code) {
      if (stderr.length) {
        return reject(new Error(Buffer.concat(stderr).toString('utf8')));
      }

      resolve(Buffer.concat(stdout));
    });
  });
}

function convertDirectly(input, option) {
  return new Promise(function(resolve, reject) {
    option.format = option.format || 'pdf';
    var stderr = [];
    var writerStream = (0, _fs.createWriteStream)(option.output);
    var unoconv = (0, _child_process.spawn)('unoconv', [
      '-f',
      option.format,
      '--stdout',
      input,
    ]);
    unoconv.on('error', function(err) {
      if (err.message.indexOf('ENOENT') > -1) {
        console.error('unoconv command not found');
      }

      return reject(err);
    });
    unoconv.stdout.pipe(writerStream);
    unoconv.stderr.on('data', function(data) {
      stderr.push(data);
    });
    unoconv.on('close', function(code) {
      if (stderr.length) {
        return reject(new Error(Buffer.concat(stderr).toString('utf8')));
      }

      resolve(option.output);
    });
  });
}
