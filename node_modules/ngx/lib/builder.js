'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _file = require('./util/file');

var _compiler = require('./compiler');

var _compiler2 = _interopRequireDefault(_compiler);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(_ref2) {
    var _this = this;

    var src = _ref2.src,
        dest = _ref2.dest,
        config = _ref2.data,
        entry = _ref2.entry,
        map = _ref2.map;
    var absEntry, includeServer, servers, data;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            absEntry = _path2.default.join(src, entry);

            includeServer = function () {
              var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(server) {
                var data, compiler;
                return _regenerator2.default.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        data = (0, _extends3.default)({}, config);


                        (0, _assign2.default)(data, server.data);

                        compiler = new _compiler2.default({
                          src: src,
                          dest: dest,
                          data: data,
                          file: entry,
                          map: map
                        });
                        _context.next = 5;
                        return server.toString(compiler.directives.include);

                      case 5:
                        return _context.abrupt('return', _context.sent);

                      case 6:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, _this);
              }));

              return function includeServer(_x2) {
                return _ref3.apply(this, arguments);
              };
            }();

            _context2.next = 4;
            return _promise2.default.all(config.servers.map(includeServer));

          case 4:
            servers = _context2.sent;
            data = (0, _extends3.default)({}, config, {
              servers: servers.join('\n\n')

              // Ensure dir "logs" which is required by nginx by default
            });
            _context2.next = 8;
            return _fsExtra2.default.ensureDir(_path2.default.join(dest, 'logs'));

          case 8:
            _context2.next = 10;
            return new _compiler2.default({
              src: src,
              dest: dest,
              data: data,
              file: entry,
              map: map,
              isEntry: true
            }).transform();

          case 10:
            return _context2.abrupt('return', {
              src: src,
              dest: dest,
              data: data,
              entry: entry
            });

          case 11:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  function build(_x) {
    return _ref.apply(this, arguments);
  }

  return build;
}();