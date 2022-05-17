#!/usr/bin/env node
'use strict';

var _commander = require('../util/commander');

var _process = require('../util/process');

var _file = require('../util/file');

var _ = require('..');

var options = (0, _commander.parse)();
var cwd = options.cwd,
    args = options.args;


(0, _.parseOptions)(options).then(function (_ref) {
  var dest = _ref.dest,
      preset = _ref.preset;

  return (0, _file.readSavedUpstreams)(dest).catch(function (err) {
    (0, _process.debug)('read upstreams error: %s', err.stack || err);
    (0, _process.log)('{{white.bgYellow warn}} fails to read runtime upstreams, fallback to config...');
    (0, _process.log)('{{white.bgYellow warn}} which means maybe your nginx server is not started.');
    return readUpstreams(preset);
  });
}).then(function (upstreams) {
  args.length ? list(upstreams, args[0]) : list_all(upstreams);
});

function readUpstreams(yaml) {
  return (0, _file.readYaml)(yaml).then(function (config) {
    return config.upstreams;
  });
}

function list_all(upstreams) {
  upstreams.forEach(function (name, servers) {
    (0, _process.log)('{{cyan name}}', { name: name });

    servers.forEach(function (_ref2) {
      var ip = _ref2.ip,
          port = _ref2.port,
          enabled = _ref2.enabled;

      if (!enabled) {
        return;
      }

      (0, _process.log)('  - ' + ip + ':' + port);
    });

    (0, _process.log)();
  });
}

function list(upstreams, name) {
  var servers = upstreams[name];

  if (!servers) {
    (0, _process.fail)('upstream "' + name + '" not found');
  }

  servers.forEach(function (_ref3) {
    var ip = _ref3.ip,
        port = _ref3.port,
        enabled = _ref3.enabled;

    if (!enabled) {
      return;
    }

    (0, _process.log)('- ' + ip + ':' + port);
  });
}