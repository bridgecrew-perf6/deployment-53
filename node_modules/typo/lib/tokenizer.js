'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var escape_regex = require('escape-string-regexp');
var split = require('split-string');
var REGEX_ENDS_WITH_SLASH = /\\$/;
var REGEX_CODE_SLICE = /^(\s*)([\s\S]+?)(\s*)$/;
var REGEX_SPLIT_CR = /\r|\n/g;

module.exports = function () {
  function Tokenizer(_ref) {
    var open = _ref.open,
        close = _ref.close;
    (0, _classCallCheck3.default)(this, Tokenizer);


    this._open = open.trim();
    this._close = close.trim();
    this._regex = null;
  }

  (0, _createClass3.default)(Tokenizer, [{
    key: '_reset',
    value: function _reset() {
      this._line = 1;
      this._column = 1;
      this._parsed = [];
    }
  }, {
    key: 'parse',
    value: function parse(template) {
      this._reset();

      // if template is an emptry string, skip parsing
      if (template === '') {
        return [{
          type: 'String',
          value: template
        }];
      }

      this._parse(template);
      return this._parsed;
    }

    // parse a template into a typo object
    // 'a{{a\\ b c d}} {'

  }, {
    key: '_parse',
    value: function _parse(template) {
      var parsed = [];
      var regex = this.regex;

      var reader = void 0;
      var matched = void 0;
      var slice = void 0;
      var pos = 0;

      while ((reader = regex.exec(template)) !== null) {
        matched = reader[0];
        slice = reader[1];

        // // We met a carrige return
        // if (!slice) {
        //   this._increase_line(1)
        //   continue
        // }

        // normal string
        if (reader.index > pos && reader.index > 0) {
          this._digest_normal_string(template.substring(pos, reader.index));
        }

        pos = reader.index + matched.length;
        this._digest_directive(slice);
      }

      if (pos < template.length) {
        this._digest_normal_string(template.substring(pos));
      }
    }
  }, {
    key: '_digest_normal_string',
    value: function _digest_normal_string(string) {
      this._parsed.push({
        type: 'String',
        value: string,
        loc: this._loc()
      });

      this._digest_cr(string);
    }
  }, {
    key: '_increase_line',
    value: function _increase_line() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      this._line += n;
      this._column = 1;
    }
  }, {
    key: '_increase_column',
    value: function _increase_column() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      this._column += n;
    }

    // simple value
    // 'abc'            -> { helper: [], param: 'abc' }

    // one helper, one parameter
    // 'a   abc'        -> { helper: ['a'], param: 'abc' }

    // piped helpers
    // 'a|b abc'        -> { helper: ['a', 'b'], param: 'abc' }
    // 'a|b abc'        -> { helper: ['a', 'b'], param: 'abc' }

  }, {
    key: '_digest_directive',
    value: function _digest_directive(slice) {
      // {{
      this._digest_open();

      var _slice$match = slice.match(REGEX_CODE_SLICE),
          _slice$match2 = (0, _slicedToArray3.default)(_slice$match, 4),
          prefix_cr = _slice$match2[1],
          content = _slice$match2[2],
          suffix_cr = _slice$match2[3];

      // The potential whitespace or carriage return


      this._digest_cr(prefix_cr);

      var _split_directive2 = this._split_directive(slice, ' '),
          _split_directive3 = (0, _slicedToArray3.default)(_split_directive2, 2),
          helper = _split_directive3[0],
          replacer = _split_directive3[1];

      helper
      // {{blue moon}}
      ? this._digest_helper_replacer(helper, replacer)
      // {{name}}
      : this._digest_replacer(replacer);

      this._digest_cr(suffix_cr);

      // }}
      this._digest_close();
    }
  }, {
    key: '_digest_open',
    value: function _digest_open() {
      this._increase_column(this._open.length);
    }
  }, {
    key: '_digest_close',
    value: function _digest_close() {
      this._increase_column(this._close.length);
    }

    // Handle cursor

  }, {
    key: '_digest_cr',
    value: function _digest_cr(slice) {
      var _count_cr2 = this._count_cr(slice),
          count = _count_cr2.count,
          last = _count_cr2.last;

      if (count) {
        this._increase_line(count);
      }

      this._increase_column(last.length);
    }
  }, {
    key: '_digest_replacer',
    value: function _digest_replacer(replacer) {
      this._parsed.push({
        type: 'Replacer',
        value: replacer,
        loc: this._loc()
      });

      this._digest_cr(replacer);
    }
  }, {
    key: '_digest_helper_replacer',
    value: function _digest_helper_replacer(helper, replacer) {
      var _this = this;

      var helper_nodes = [];
      var node = {
        type: 'Directive',
        helpers: helper_nodes,
        replacer: null
      };

      var helpers = split(helper, '|');
      var helpers_length = helpers.length;

      helpers.forEach(function (helper, i) {
        _this._digest_helper(helper, helper_nodes);

        if (i < helpers_length - 1) {
          _this._increase_column(1);
        }
      });

      // The space
      this._increase_column(1);

      node.replacer = {
        type: 'Replacer',
        value: replacer,
        loc: this._loc()
      };

      this._digest_cr(replacer);

      this._parsed.push(node);
    }
  }, {
    key: '_digest_helper',
    value: function _digest_helper(helper, nodes) {
      var _split = split(helper, ':'),
          _split2 = (0, _slicedToArray3.default)(_split, 2),
          name = _split2[0],
          param = _split2[1];

      nodes.push({
        type: 'Helper',
        name: name,
        param: param,
        loc: this._loc()
      });

      this._digest_cr(helper);
    }
  }, {
    key: '_loc',
    value: function _loc() {
      return {
        line: this._line,
        col: this._column
      };
    }

    // split a template into two parts by the specified `splitter` and will ignore the escaped `'\\' + splitter`

  }, {
    key: '_split_directive',
    value: function _split_directive(template, splitter) {
      var splitted = split(template, splitter);

      return splitted.length > 1 ? [splitted.shift(), splitted.join(splitter)] : ['', template];
    }
  }, {
    key: '_count_cr',
    value: function _count_cr(str) {
      var splitted = str.split(REGEX_SPLIT_CR);
      return {
        count: splitted.length - 1,
        last: splitted.pop()
      };
    }
  }, {
    key: 'regex',
    get: function get() {
      if (this._regex) {
        return this._regex;
      }

      return this._regex = new RegExp(escape_regex(this._open) + '(.+?)' + escape_regex(this._close), 'g');
    }
  }]);
  return Tokenizer;
}();