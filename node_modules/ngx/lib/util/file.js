'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readSavedUpstreams = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var parseYaml = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(content) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt('return', _jsYaml2.default.safeLoad(content));

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function parseYaml(_x) {
    return _ref.apply(this, arguments);
  };
}();

var readSavedUpstreams = exports.readSavedUpstreams = function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(dir) {
    var upstreams;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            upstreams = require(upstreamFile(dir));


            Object.defineProperty(upstreams, 'forEach', {
              value: function value(fn) {
                (0, _keys2.default)(upstreams).forEach(function (name) {
                  fn(name, upstreams[name]);
                });
              },
              enumerable: false
            });

            return _context3.abrupt('return', upstreams);

          case 3:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function readSavedUpstreams(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

exports.readYaml = readYaml;
exports.readFile = readFile;
exports.decorate = decorate;
exports.handleSemicolon = handleSemicolon;
exports.saveUpstreams = saveUpstreams;
exports.removeSavedUpstreams = removeSavedUpstreams;

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _codeStringify = require('code-stringify');

var _codeStringify2 = _interopRequireDefault(_codeStringify);

var _upstream = require('../entity/upstream');

var _server = require('../entity/server');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function readYaml(filepath) {
  var base = _path2.default.basename(filepath);

  return readFile(filepath).then(parseYaml).then(function (config) {
    config.upstreams = new _upstream.Upstreams(config.upstreams);
    config.servers = new _server.Servers(cleanServers(config.servers), { base: base });

    return config;
  });
}

// TODO
function cleanServers(servers, filepath) {
  // resolve server.include
  return servers;
}

function readFile(filepath) {
  return _fsExtra2.default.readFile(filepath).then(function (content) {
    return content.toString();
  }).catch(function (err) {
    var error = new Error('fails to read "' + filepath + '", ' + err.stack);
    // make sure the original error.code
    error.code = err.code;
    return _promise2.default.reject(error);
  });
}

// abc.conf, abcde -> abc-abcde.conf
var REGEX_EXT = /\.[a-z0-9]+(?:$|\?)/;
function decorate(basename, hash) {
  return basename.replace(REGEX_EXT, function (ext) {
    return '-' + hash.slice(0, 10) + ext;
  });
}

var SEMICOLON = ';';
function handleSemicolon(fn) {
  var _this = this;

  return function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(p) {
      var lastIndex, has, result;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              lastIndex = p.lastIndexOf(SEMICOLON);
              has = lastIndex === p.length - 1;

              // removes the last semicolon

              if (has) {
                p = p.substr(0, lastIndex);
              }

              _context2.next = 5;
              return fn(p);

            case 5:
              result = _context2.sent;
              return _context2.abrupt('return', has ? result
              // {{root /path/to;}} -> root /path/to;
              ? result + SEMICOLON
              // {{root /path/to}}  -> ''
              // avoid to output an unnecessary `;`
              : ''

              // {{root /path/to}}    -> root /path/to
              : result);

            case 7:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }();
}

function upstreamFile(dir) {
  return _path2.default.join(dir, '.ngx', 'upstream.js');
}

function saveUpstreams(dir, upstreams) {
  var us = {};
  upstreams.forEach(function (name, servers) {
    us[name] = servers;
  });

  return _fsExtra2.default.outputFile(upstreamFile(dir), 'module.exports = ' + (0, _codeStringify2.default)(us, null, 2));
}

function removeSavedUpstreams(dir) {
  return _fsExtra2.default.unlink(upstreamFile(dir));
}