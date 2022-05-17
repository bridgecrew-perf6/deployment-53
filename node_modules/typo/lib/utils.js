'use strict';

module.exports = {
  get_helper: get_helper,
  get_value: get_value
};

var access = require('object-access');
var frame = require('babel-code-frame');
var NOT_FOUND = {};

function get(name, object, template, loc, message) {
  name = name.trim();
  var value = access(object, name, NOT_FOUND);

  if (value !== NOT_FOUND) {
    return value;
  }

  throw new Error(message + '\n\n' + create_frame(template, loc));
}

function get_helper(name, helpers, template, loc) {
  return get(name, helpers, template, loc, 'directive "' + name + '" not defined');
}

function get_value(name, data, template, loc) {
  return get(name, data, template, loc, 'value not found for key "' + name + '"');
}

function create_frame(template, loc) {
  return frame(template, loc.line, loc.col);
}