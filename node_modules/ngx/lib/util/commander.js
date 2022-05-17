'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.program = undefined;
exports.parse = parse;

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default
// If we use sudo, we could not specify env by
//  NGX_ENV=production ngx reload
.option('-e, --env [env]', 'specify environment, defaults to "production"').option('-c, --cwd [cwd]', 'set current working directory').option('-u, --user [user]', 'define the <user>:<group> used by worker processes');

exports.program = _commander2.default;


var NOOP = function NOOP() {};

function parse() {
  var extra = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : NOOP;

  extra(_commander2.default);

  _commander2.default.parse(process.argv);

  _commander2.default.cwd = _commander2.default.cwd ? _path2.default.resolve(_commander2.default.cwd) : process.cwd();

  if (_commander2.default.user) {
    var splitted = _commander2.default.user.split(':');
    _commander2.default.user = splitted[0];
    _commander2.default.group = splitted[1] || splitted[0];
  }

  return _commander2.default;
}