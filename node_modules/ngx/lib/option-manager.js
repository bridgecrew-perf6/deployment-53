'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _json = require('json5');

var _json2 = _interopRequireDefault(_json);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _file = require('./util/file');

var _preSuf = require('pre-suf');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_ENV = 'production';

module.exports = function () {
  function OptionManager(_ref) {
    var cwd = _ref.cwd,
        env = _ref.env;
    (0, _classCallCheck3.default)(this, OptionManager);


    this.cwd = _path2.default.resolve(cwd);
    this.env = env || undefined || DEFAULT_ENV;
  }

  (0, _createClass3.default)(OptionManager, [{
    key: '_readNgxrc',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        var rc, content;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                rc = _path2.default.join(this.cwd, '.ngxrc');
                _context.next = 3;
                return (0, _file.readFile)(rc);

              case 3:
                content = _context.sent;
                return _context.abrupt('return', {
                  value: _json2.default.parse(content),
                  filepath: rc,
                  type: 'rc'
                });

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _readNgxrc() {
        return _ref2.apply(this, arguments);
      }

      return _readNgxrc;
    }()
  }, {
    key: '_readNgxrcJs',
    value: function _readNgxrcJs() {
      var rcjs = _path2.default.join(this.cwd, '.ngxrc.js');
      return {
        value: require(rcjs),
        filepath: rcjs,
        type: 'js'
      };
    }
  }, {
    key: '_readPackage',
    value: function _readPackage() {
      var packageJson = _path2.default.join(this.cwd, 'package.json');
      var pkg = require(packageJson);

      if (!pkg.ngx) {
        return;
      }

      return {
        value: pkg.ngx,
        filepath: packageJson,
        type: 'package'
      };
    }
  }, {
    key: '_read',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                _context2.next = 3;
                return this._readNgxrc();

              case 3:
                return _context2.abrupt('return', _context2.sent);

              case 6:
                _context2.prev = 6;
                _context2.t0 = _context2['catch'](0);

                if (!(_context2.t0.code !== 'ENOENT')) {
                  _context2.next = 10;
                  break;
                }

                throw _context2.t0;

              case 10:
                _context2.prev = 10;
                _context2.next = 13;
                return this._readNgxrcJs();

              case 13:
                return _context2.abrupt('return', _context2.sent);

              case 16:
                _context2.prev = 16;
                _context2.t1 = _context2['catch'](10);

                if (!(_context2.t1.code !== 'MODULE_NOT_FOUND')) {
                  _context2.next = 20;
                  break;
                }

                throw _context2.t1;

              case 20:
                _context2.prev = 20;
                _context2.next = 23;
                return this._readPackage();

              case 23:
                return _context2.abrupt('return', _context2.sent);

              case 26:
                _context2.prev = 26;
                _context2.t2 = _context2['catch'](20);

                if (!(_context2.t2.code !== 'MODULE_NOT_FOUND')) {
                  _context2.next = 30;
                  break;
                }

                throw _context2.t2;

              case 30:
                throw new Error('.ngxrc not found');

              case 31:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 6], [10, 16], [20, 26]]);
      }));

      function _read() {
        return _ref3.apply(this, arguments);
      }

      return _read;
    }()
  }, {
    key: 'get',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
        var _ref5, rc, filepath, preset, src, dest, entry, relativeEntry, volumes, _ref6, map;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this._read();

              case 2:
                _ref5 = _context3.sent;
                rc = _ref5.value;
                filepath = _ref5.filepath;


                this._rc = rc;
                this._rcBase = _path2.default.dirname(filepath);

                preset = this._presetFile();
                src = this._resolve('src');
                dest = this._resolve('dest');
                entry = this._resolve('entry');
                relativeEntry = _path2.default.relative(src, entry);

                if (!(relativeEntry.indexOf('..') === 0)) {
                  _context3.next = 14;
                  break;
                }

                return _context3.abrupt('return', _promise2.default.reject(new Error('entry should inside directory `src`')));

              case 14:
                volumes = this._parseVolumes();
                _ref6 = new Mapper(volumes), map = _ref6.map;
                return _context3.abrupt('return', {
                  // `path` absolute path, the unbuilt source files
                  src: src,
                  // `path` absolute path, the directory to build dest files into
                  dest: dest,
                  // `path` absolute path of the yaml configuration file
                  preset: preset,

                  // `path` relative path to `src`
                  // suppose
                  // - src: foo
                  // - entry: foo/nginx.conf
                  // -> entry: nginx.conf
                  entry: relativeEntry,
                  env: this.env,
                  map: map
                });

              case 17:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function get() {
        return _ref4.apply(this, arguments);
      }

      return get;
    }()
  }, {
    key: '_parseVolumes',
    value: function _parseVolumes() {
      var _this = this;

      var volumes = this._rc.volumes;

      if (!volumes) {
        return {};
      }

      var real = (0, _create2.default)(null);
      (0, _keys2.default)(volumes).forEach(function (from) {
        real[_this._resolveToBase(from)] = (0, _preSuf.removeEnding)(volumes[from], '/');
      });

      return real;
    }

    // Resolve a key from rc
    // - rc: resolve with rcPath

  }, {
    key: '_resolve',
    value: function _resolve(key) {
      var rc = this._rc;

      if (key in rc) {
        return this._resolveToBase(rc[key]);
      }

      throw new Error(key + ' is not defined');
    }
  }, {
    key: '_resolveToBase',
    value: function _resolveToBase(filepath) {
      var resolved = _path2.default.resolve(this._rcBase, filepath);
      return (0, _preSuf.removeEnding)(resolved, '/');
    }
  }, {
    key: '_presetFile',
    value: function _presetFile() {
      var preset = this._rc.preset;


      if (!preset) {
        throw new Error('preset is not defined');
      }

      if (Object(preset) === preset) {
        preset = preset[this.env];

        if (!preset) {
          throw new Error('preset for env "' + this.env + '" is not defined in ".ngxrc"');
        }
      }

      return _path2.default.resolve(this._rcBase, preset);
    }
  }]);
  return OptionManager;
}();

var justReturn = function justReturn(x) {
  return x;
};

var Mapper = function () {
  function Mapper(mapper) {
    (0, _classCallCheck3.default)(this, Mapper);

    this._mapper = mapper;
    this._paths = (0, _keys2.default)(mapper);

    this.map = !this._paths.length ? justReturn : this.map.bind(this);
  }

  (0, _createClass3.default)(Mapper, [{
    key: 'map',
    value: function map(path) {
      var index = this._paths.findIndex(function (from) {
        if (path.indexOf(from) === 0) {
          return true;
        }
      });

      if (!~index) {
        return path;
      }

      var from = this._paths[index];
      return this._mapper[from] + path.slice(from.length);
    }
  }]);
  return Mapper;
}();