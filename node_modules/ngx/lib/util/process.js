'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debug = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.spawn = spawn;
exports.log = log;
exports.template = template;
exports.fail = fail;

var _crossSpawn = require('cross-spawn');

var _crossSpawn2 = _interopRequireDefault(_crossSpawn);

var _debug2 = require('debug');

var _debug3 = _interopRequireDefault(_debug2);

var _typo2 = require('typo');

var _typo3 = _interopRequireDefault(_typo2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = exports.debug = (0, _debug3.default)('ngx');

function spawn(command, args) {
  debug('spawn %s %s', command, args.join(' '));

  var p = (0, _crossSpawn2.default)(command, args, {
    stdio: 'inherit'
  });

  return new _promise2.default(function (resolve, reject) {
    p.on('close', function (code) {
      if (code === 0) {
        return resolve();
      }

      var error = new Error('command exit with code ' + code);
      error.code = 'ERR_CHILD_PROCESS';
      error.exitCode = code;
      reject(error);
    });
  });
}

var typo = (0, _typo3.default)().use(require('typo-chalk'));

function log(t, data) {
  var str = template(t, data);
  console.log(str);
}

function template() {
  var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return typo.template(t, data, {
    async: false
  });
}

function fail(err) {
  var is_error = err instanceof Error;

  var message = template('{{white.bgRed Error}} ') + (is_error ? err.stack : message);

  var code = is_error ? err.exitCode ? err.exitCode : 1 : 1;

  console.error(message);
  process.exit(1);
}