'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  reload: reload,
  stop: stop,
  test: test,
  start: start

  // @param {path} dest
};
function nginx(dest, entry) {
  var rest = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  return ['nginx', ['-p', dest, '-c', _path2.default.join(dest, entry)].concat((0, _toConsumableArray3.default)(rest))];
}

function reload(dest, entry) {
  return nginx(dest, entry, ['-s', 'reload']);
}

function stop(dest, entry) {
  return nginx(dest, entry, ['-s', 'stop']);
}

function test(dest, entry) {
  return nginx(dest, entry, ['-t']);
}

function start(dest, entry) {
  return nginx(dest, entry);
}