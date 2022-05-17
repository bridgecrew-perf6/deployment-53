'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UpstreamServer = exports.Upstream = exports.Upstreams = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _for = require('babel-runtime/core-js/symbol/for');

var _for2 = _interopRequireDefault(_for);

var _makeArray = require('make-array');

var _makeArray2 = _interopRequireDefault(_makeArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UPSTREAMS_ADD = (0, _for2.default)('add-upstream');


var RESERVED_UPSTREAM_NAMES = ['constructor', 'remove', 'forEach', 'toString'];

var Upstreams = exports.Upstreams = function () {
  function Upstreams(upstreams) {
    var _this = this;

    (0, _classCallCheck3.default)(this, Upstreams);

    this._upstreams = {};

    (0, _keys2.default)(upstreams).forEach(function (name) {
      if (~RESERVED_UPSTREAM_NAMES.indexOf(name)) {
        throw new Error('upstream name "' + name + '" is reserved');
      }

      _this[UPSTREAMS_ADD](name, upstreams[name]);
    });
  }

  (0, _createClass3.default)(Upstreams, [{
    key: UPSTREAMS_ADD,
    value: function value(name, upstream) {
      this._upstreams[name] = new Upstream(name, upstream);

      (0, _defineProperty2.default)(this, name, {
        get: function get() {
          return this._upstreams[name];
        }
      });
    }
  }, {
    key: 'remove',
    value: function remove() {
      var _this2 = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      (0, _keys2.default)(this._upstreams).forEach(function (name) {
        var _upstreams$name;

        (_upstreams$name = _this2._upstreams[name]).remove.apply(_upstreams$name, args);
      });

      return this;
    }
  }, {
    key: 'forEach',
    value: function forEach(fn) {
      var _this3 = this;

      (0, _keys2.default)(this._upstreams).forEach(function (name) {
        fn(name, _this3._upstreams[name].value());
      });

      return this;
    }
  }, {
    key: 'toString',
    value: function toString() {
      var _this4 = this;

      return (0, _keys2.default)(this._upstreams).map(function (name) {
        return _this4._upstreams[name].toString();
      }).join('\n\n');
    }
  }]);
  return Upstreams;
}();

var Upstream = exports.Upstream = function () {
  function Upstream(name, _ref) {
    var server_options = _ref.server_options,
        server = _ref.server;
    (0, _classCallCheck3.default)(this, Upstream);


    this._name = name;
    this._servers = (0, _makeArray2.default)(server).map(function (server) {
      return new UpstreamServer(server, server_options);
    });
  }

  // List all servers


  (0, _createClass3.default)(Upstream, [{
    key: 'value',
    value: function value() {
      return this._servers.map(function (server) {
        return server.value();
      });
    }
  }, {
    key: 'forEach',
    value: function forEach(fn) {
      this._servers.forEach(function (server, i) {
        fn(server.value(), i);
      });

      return this;
    }
  }, {
    key: 'remove',
    value: function remove() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      this._servers.forEach(function (server) {
        if (server.is.apply(server, args)) {
          server.disable();
        }
      });

      return this;
    }
  }, {
    key: '_serverToString',
    value: function _serverToString() {
      return this._servers.filter(function (server) {
        return server.enabled();
      }).map(function (server) {
        return server.toString();
      }).join('\n');
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'upstream ' + this._name + ' {\n' + this._serverToString() + '\n}';
    }
  }]);
  return Upstream;
}();

var REGEX_SERVER = /(^[^:]+)(?::(\d+))?(?:\s+(.*))?$/;

var UpstreamServer = exports.UpstreamServer = function () {
  function UpstreamServer(server) {
    var default_options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    (0, _classCallCheck3.default)(this, UpstreamServer);

    var _parse2 = this._parse(server),
        ip = _parse2.ip,
        port = _parse2.port,
        options = _parse2.options;

    this._enabled = true;
    this._ip = ip;
    this._port = port;
    this._options = options ? options : default_options;
  }

  (0, _createClass3.default)(UpstreamServer, [{
    key: 'is',
    value: function is(ip, port) {
      return this._ip === ip && (
      // we check arguments.length rather than checking
      // whether port is nullable,
      // for that people might make mistakes to pass
      // port argument of null/undefined value
      arguments.length === 1 || this._port === port);
    }
  }, {
    key: 'enabled',
    value: function enabled() {
      return this._enabled;
    }
  }, {
    key: 'disable',
    value: function disable() {
      this._enabled = false;
      return this;
    }
  }, {
    key: 'value',
    value: function value() {
      return {
        ip: this._ip,
        port: this._port,
        enabled: this._enabled,
        options: (0, _assign2.default)({}, this._options)
      };
    }
  }, {
    key: '_parse_options',
    value: function _parse_options(options_string) {
      if (!options_string) {
        return null;
      }

      var options = {};
      options_string.split(/\s+/g).forEach(function (pair) {
        var _pair$split = pair.split('='),
            _pair$split2 = (0, _slicedToArray3.default)(_pair$split, 2),
            name = _pair$split2[0],
            _pair$split2$ = _pair$split2[1],
            value = _pair$split2$ === undefined ? true : _pair$split2$;

        options[name] = value;
      });

      return options;
    }
  }, {
    key: '_parse',
    value: function _parse(server) {
      var match = server.match(REGEX_SERVER);
      return {
        ip: match[1],
        port: match[2] || 80,
        options: this._parse_options(match[3])
      };
    }
  }, {
    key: '_stringify_options',
    value: function _stringify_options(options) {
      return options ? ' ' + (0, _keys2.default)(options).map(function (name) {
        var value = options[name];

        return value === true ? name : name + '=' + options[name];
      }).join(' ') : '';
    }
  }, {
    key: 'toString',
    value: function toString() {
      var options_string = this._stringify_options(this._options);
      return '  server ' + this._ip + ':' + this._port + options_string + ';';
    }
  }]);
  return UpstreamServer;
}();