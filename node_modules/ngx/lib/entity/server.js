'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Server = exports.Servers = undefined;

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

var _makeArray = require('make-array');

var _makeArray2 = _interopRequireDefault(_makeArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Servers = exports.Servers = function () {
  function Servers(servers) {
    (0, _classCallCheck3.default)(this, Servers);

    this._servers = (0, _makeArray2.default)(servers).map(function (server) {
      return new Server(server);
    });
  }

  (0, _createClass3.default)(Servers, [{
    key: 'map',
    value: function map(fn) {
      return this._servers.map(fn);
    }

    // async toString (include) {
    //   return Promise.all(
    //     this._servers.map(server => server.toString(include))
    //   )
    //   .then(contents => {
    //     return contents.join('\n\n')
    //   })
    // }

  }]);
  return Servers;
}();

var Server = exports.Server = function () {
  function Server(_ref) {
    var _ref$port = _ref.port,
        port = _ref$port === undefined ? [80, 443] : _ref$port,
        server_name = _ref.server_name,
        include = _ref.include,
        _ref$data = _ref.data,
        data = _ref$data === undefined ? {} : _ref$data;
    (0, _classCallCheck3.default)(this, Server);


    this._port = (0, _makeArray2.default)(port).map(Number);
    this._server_name = (0, _makeArray2.default)(server_name);

    if (!this._server_name.length) {
      throw new Error('server_name is not defined.');
    }

    this._include = include;
    this._data = data;
  }

  (0, _createClass3.default)(Server, [{
    key: '_serverToString',


    // server {
    //   listen 80;
    //   server_name api.thebeastshop.com api-test.thebeastshop.com;
    //   limit_conn perip 20;
    //   include route/api.thebeastshop.com.conf;
    // }

    // server {
    //   listen 443 ssl http2;
    //   server_name api.thebeastshop.com api-test.thebeastshop.com;
    //   include snippet/ssl.conf;
    //   include route/api.thebeastshop.com.conf;
    // }

    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(port, include) {
        var content, ssl;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return include(this._routeString());

              case 2:
                content = _context.sent;

                if (!(port === 443)) {
                  _context.next = 8;
                  break;
                }

                _context.next = 6;
                return include('snippet/ssl.conf');

              case 6:
                ssl = _context.sent;
                return _context.abrupt('return', 'server {\n  listen ' + port + ' ssl http2;\n  server_name ' + this._server_name.join(' ') + ';\n  ' + ssl + ';\n  ' + content + ';\n}');

              case 8:
                return _context.abrupt('return', 'server {\n  listen ' + port + ';\n  server_name ' + this._server_name.join(' ') + ';\n  ' + content + ';\n}');

              case 9:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _serverToString(_x, _x2) {
        return _ref2.apply(this, arguments);
      }

      return _serverToString;
    }()
  }, {
    key: '_routeString',
    value: function _routeString() {
      return this._include ? this._include : 'route/' + this._server_name[0] + '.conf';
    }
  }, {
    key: 'toString',
    value: function toString(include) {
      var _this = this;

      return _promise2.default.all(this._port.map(function (port) {
        return _this._serverToString(port, include);
      })).then(function (contents) {
        return contents.join('\n\n');
      });
    }
  }, {
    key: 'data',
    get: function get() {
      return this._data;
    }
  }]);
  return Server;
}();