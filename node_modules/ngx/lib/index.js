'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseOptions = exports.build = exports.start = exports.stop = exports.reload = exports.test = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var parseOptions = exports.parseOptions = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref2) {
    var cwd = _ref2.cwd,
        optionEnv = _ref2.env,
        user = _ref2.user,
        group = _ref2.group;

    var _ref3, src, dest, preset, entry, env, map, data, error;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return new _optionManager2.default({
              cwd: cwd,
              env: optionEnv
            }).get();

          case 2:
            _ref3 = _context.sent;
            src = _ref3.src;
            dest = _ref3.dest;
            preset = _ref3.preset;
            entry = _ref3.entry;
            env = _ref3.env;
            map = _ref3.map;
            _context.next = 11;
            return (0, _file.readYaml)(preset);

          case 11:
            data = _context.sent;

            if (!(!data.user && !user)) {
              _context.next = 15;
              break;
            }

            error = new Error('user must be defined to prevent further problems, you can specify it either:\n  - with cli option "--user <user>:<group>"\n  - or in preset file');
            return _context.abrupt('return', _promise2.default.reject(error));

          case 15:

            // cli user has higher priority
            if (user) {
              data.user = user + ' ' + group;
            }

            data.env = env;

            return _context.abrupt('return', {
              src: src,
              dest: dest,
              data: data,
              preset: preset,
              entry: entry,
              map: map
            });

          case 18:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function parseOptions(_x) {
    return _ref.apply(this, arguments);
  };
}();

var _builder = require('./builder');

var _builder2 = _interopRequireDefault(_builder);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nginxCommand = require('./nginx-command');

var _nginxCommand2 = _interopRequireDefault(_nginxCommand);

var _optionManager = require('./option-manager');

var _optionManager2 = _interopRequireDefault(_optionManager);

var _file = require('./util/file');

var _process = require('./util/process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var save = function save(opts) {
  return (0, _file.saveUpstreams)(opts.dest, opts.data.upstreams);
};
var remove = function remove(opts) {
  return (0, _file.removeSavedUpstreams)(opts.dest);
};

var test = exports.test = c('test', '{{cyan test}} configurations ...');
var reload = exports.reload = c('reload', '{{cyan reload}} nginx ...', save);
var stop = exports.stop = c('stop', '{{cyan stop}} nginx ...', remove);
var start = exports.start = c('start', '{{cyan start}} nginx ...', save);
exports.build = _builder2.default;


function c(type, message, after) {
  var _this = this;

  return function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(opts) {
      var dest, entry;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              (0, _process.log)(message);

              dest = opts.dest, entry = opts.entry;
              _context2.next = 4;
              return _process.spawn.apply(undefined, (0, _toConsumableArray3.default)(_nginxCommand2.default[type](dest, entry)));

            case 4:
              if (!after) {
                _context2.next = 7;
                break;
              }

              _context2.next = 7;
              return after(opts);

            case 7:
              return _context2.abrupt('return', opts);

            case 8:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x2) {
      return _ref4.apply(this, arguments);
    };
  }();
}