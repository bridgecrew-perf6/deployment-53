'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// use `'{{'` instead of `'{'` by default,
// because javascript is bad at doing backward look back with regular expression.
// case:
//   {a b\\{c\\}}
var OPEN = '{{';
var CLOSE = '}}';

var Tokenizer = require('./tokenizer');

var _require = require('events'),
    EventEmitter = _require.EventEmitter;

var _require2 = require('./runtime'),
    run = _require2.run,
    run_async = _require2.run_async;

var Typo = function (_EventEmitter) {
  (0, _inherits3.default)(Typo, _EventEmitter);

  function Typo() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$open = _ref.open,
        open = _ref$open === undefined ? OPEN : _ref$open,
        _ref$close = _ref.close,
        close = _ref$close === undefined ? CLOSE : _ref$close,
        helpers = _ref.helpers;

    (0, _classCallCheck3.default)(this, Typo);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Typo.__proto__ || (0, _getPrototypeOf2.default)(Typo)).call(this));

    _this._helpers = {};
    _this._tokenizer = new Tokenizer({ open: open, close: close });

    if (helpers) {
      _this.use(helpers);
    }
    return _this;
  }

  (0, _createClass3.default)(Typo, [{
    key: 'compile',
    value: function compile(template) {
      var _this2 = this;

      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$async = _ref2.async,
          async = _ref2$async === undefined ? true : _ref2$async,
          concurrency = _ref2.concurrency,
          _ref2$value_not_defin = _ref2.value_not_defined,
          value_not_defined = _ref2$value_not_defin === undefined ? 'print' : _ref2$value_not_defin,
          directive_value_not_defined = _ref2.directive_value_not_defined;

      var tokens = this._tokenizer.parse(template);
      return function () {
        var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var runner = async ? run_async : run;

        return runner({
          tokens: tokens,
          data: data,
          helpers: _this2._helpers,
          value_not_defined: value_not_defined,
          directive_value_not_defined: directive_value_not_defined || value_not_defined,
          template: template,
          concurrency: concurrency
        });
      };
    }
  }, {
    key: 'template',
    value: function template(_template, data, options) {
      return this.compile(_template, options)(data);
    }
  }, {
    key: '_use',
    value: function _use(name, helper) {
      // TODO: assertion
      this._helpers[name] = helper;
    }
  }, {
    key: 'use',
    value: function use(name, helper) {
      var _this3 = this;

      if (Object(name) === name) {
        (0, _keys2.default)(name).forEach(function (n) {
          _this3._use(n, name[n]);
        });
        return this;
      }

      this._use(name, helper);
      return this;
    }
  }]);
  return Typo;
}(EventEmitter);

module.exports = {
  OPEN: OPEN,
  CLOSE: CLOSE,
  Typo: Typo
};