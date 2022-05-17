'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _defineProperties = require('babel-runtime/core-js/object/define-properties');

var _defineProperties2 = _interopRequireDefault(_defineProperties);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _typo = require('typo');

var _typo2 = _interopRequireDefault(_typo);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _isGlob = require('is-glob');

var _isGlob2 = _interopRequireDefault(_isGlob);

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _file = require('./util/file');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NGX = (0, _symbol2.default)('ngx-cleaned');

var Compiler = function () {
  function Compiler(_ref) {
    var _ref$data = _ref.data,
        data = _ref$data === undefined ? {} : _ref$data,
        file = _ref.file,
        dest = _ref.dest,
        src = _ref.src,
        map = _ref.map,
        isEntry = _ref.isEntry;
    (0, _classCallCheck3.default)(this, Compiler);


    this.data = data;
    this.src = src;
    this.dest = dest;
    this.isEntry = isEntry;
    this.map = map;

    this.file = file;
    this.filepath = _path2.default.join(src, file);
    this.destpath = _path2.default.join(dest, file);

    this.filebase = _path2.default.dirname(this.filepath);
    this.destFilebase = _path2.default.dirname(this.destpath);

    this.directives = (0, _create2.default)(null);

    this.includes = [];

    this._createCompiler();
  }

  (0, _createClass3.default)(Compiler, [{
    key: '_createCompiler',
    value: function _createCompiler() {
      var _this = this;

      var directives = this.directives;

      var methods = 'root include pid error_log user'.split(' ');

      var impls = [this._directive('root'), function (p) {
        return _this._include(p);
      }, this._ensure('pid'), this._ensure('error_log'), function (p) {
        return _this._user(p);
      }].map(_file.handleSemicolon);

      methods.forEach(function (name, i) {
        directives[name] = impls[i];
      });

      this._typo = (0, _typo2.default)().use(directives);
    }
  }, {
    key: '_resolve',
    value: function _resolve(p) {
      var abs = _path2.default.join(this.filebase, p);
      var relative = _path2.default.relative(this.src, abs);
      var inside = relative.indexOf('..') !== 0;

      return {
        // `Boolean` whether inside the src
        inside: inside,

        // `path` absolute path of the file to be written to
        destpath: inside ? _path2.default.join(this.destFilebase, p) : abs,

        srcpath: abs,

        // `path` relative path to src
        file: inside ? relative : undefined
      };
    }

    // @returns `function` the helper function to handle paths

  }, {
    key: '_directive',
    value: function _directive(name) {
      var _this2 = this;

      return function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(p) {
          return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt('return', name + ' ' + _this2.map(_this2._resolve(p).srcpath));

                case 1:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this2);
        }));

        return function (_x) {
          return _ref2.apply(this, arguments);
        };
      }();
    }

    // @returns `function` the helper function to handle paths and
    // ensures directory

  }, {
    key: '_ensure',
    value: function _ensure(name) {
      var _this3 = this;

      return function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(p) {
          var _resolve2, destpath, dir;

          return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _resolve2 = _this3._resolve(p), destpath = _resolve2.destpath;
                  dir = _path2.default.dirname(destpath);
                  _context2.next = 4;
                  return _fsExtra2.default.ensureDir(dir);

                case 4:
                  return _context2.abrupt('return', name + ' ' + _this3.map(destpath));

                case 5:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, _this3);
        }));

        return function (_x2) {
          return _ref3.apply(this, arguments);
        };
      }();
    }

    // @returns `function`
    // - recursively compile included files
    // - handle glob stars

  }, {
    key: '_include',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(p) {
        var _resolve3, file, destpath, inside;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _resolve3 = this._resolve(p), file = _resolve3.file, destpath = _resolve3.destpath, inside = _resolve3.inside;

                // If is outside the src, then use its own address

                if (inside) {
                  _context3.next = 3;
                  break;
                }

                return _context3.abrupt('return', 'include ' + destpath);

              case 3:
                if ((0, _isGlob2.default)(file)) {
                  _context3.next = 5;
                  break;
                }

                return _context3.abrupt('return', this._includeOne(file));

              case 5:
                return _context3.abrupt('return', this._includeMany(file));

              case 6:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _include(_x3) {
        return _ref4.apply(this, arguments);
      }

      return _include;
    }()

    // Do not allow to use upstreams and servers in non-entry file

  }, {
    key: '_cleanData',
    value: function _cleanData(data) {
      if (data[NGX]) {
        return data;
      }

      var cleaned = (0, _extends3.default)({}, data);

      (0, _defineProperties2.default)(cleaned, (0, _defineProperty3.default)({
        upstreams: {
          get: function get() {
            throw new Error('{{upstreams}} is not allowed in non-entry files, "' + file + '"');
          }
        },

        servers: {
          get: function get() {
            throw new Error('{{servers}} is not allowed in non-entry files, "' + file + '"');
          }
        }

      }, NGX, {
        value: true
      }));

      return cleaned;
    }
  }, {
    key: '_includeOne',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(file) {
        var data, dest, src, map, sub, _ref6, compiledDest;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                data = this._cleanData(this.data);
                dest = this.dest, src = this.src, map = this.map;
                sub = new Compiler({
                  data: data,
                  file: file,
                  dest: dest,
                  src: src,
                  map: map
                });

                this.includes.push(sub);

                // Or we should use the new compiled file
                _context4.next = 6;
                return sub.transform();

              case 6:
                _ref6 = _context4.sent;
                compiledDest = _ref6.destpath;
                return _context4.abrupt('return', 'include ' + this.map(compiledDest));

              case 9:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function _includeOne(_x4) {
        return _ref5.apply(this, arguments);
      }

      return _includeOne;
    }()
  }, {
    key: '_includeMany',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(file) {
        var _this4 = this;

        var files;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return (0, _globby2.default)(file, {
                  cwd: this.src
                });

              case 2:
                files = _context5.sent;
                return _context5.abrupt('return', _promise2.default.all(files.map(function (file) {
                  return _this4._includeOne(file);
                })).then(function (results) {
                  return results.join(';\n');
                }));

              case 4:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _includeMany(_x5) {
        return _ref7.apply(this, arguments);
      }

      return _includeMany;
    }()
  }, {
    key: '_user',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(user) {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt('return', 'user ' + user);

              case 1:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function _user(_x6) {
        return _ref8.apply(this, arguments);
      }

      return _user;
    }()
  }, {
    key: 'transform',
    value: function () {
      var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7() {
        var compiled, hash, destpath;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this._template();

              case 2:
                compiled = _context7.sent;
                hash = _crypto2.default.createHash('sha256').update(compiled).digest('hex');
                destpath = this.isEntry ? this.destpath : (0, _file.decorate)(this.destpath, hash);
                _context7.next = 7;
                return _fsExtra2.default.outputFile(destpath, compiled);

              case 7:
                return _context7.abrupt('return', {
                  destpath: destpath
                });

              case 8:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function transform() {
        return _ref9.apply(this, arguments);
      }

      return transform;
    }()
  }, {
    key: '_template',
    value: function _template() {
      var _this5 = this;

      return (0, _file.readFile)(this.filepath).then(function (content) {
        return _this5._typo.template(content, _this5.data, {
          value_not_defined: 'throw',
          directive_value_not_defined: 'print'
        });
      });
    }
  }]);
  return Compiler;
}();

exports.default = Compiler;