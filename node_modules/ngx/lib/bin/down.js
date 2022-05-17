#!/usr/bin/env node
'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _commander = require('../util/commander');

var _process = require('../util/process');

var _ = require('..');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander.program.usage('<ip>[:<port>] ... [options]');

var options = (0, _commander.parse)(function (program) {
  program.option('-u, --upstream [upstream]', 'limit the <ip>:<port> matching within specific upstreams. If more than one upstreams are provided, they should be divided with ";"');
});

var servers = options.args;
var withinUpstreams = options.upstream;

if (!servers || !servers.length) {
  return (0, _process.fail)('no server specified');
}

(0, _.parseOptions)(options).then(function (opts) {
  var upstreams = opts.data.upstreams;

  if (withinUpstreams) {
    split(withinUpstreams, ',').forEach(function (name) {
      var upstream = upstreams[name];
      if (!upstream) {
        throw new Error('upstream "' + name + '" not found');
      }

      servers.forEach(function (server) {
        remove(upstream, server, name);
      });
    });
    return opts;
  }

  servers.forEach(function (server) {
    remove(upstreams, server);
  });

  return opts;
}).then(_.build).then(_.reload).catch(_process.fail);

function remove(upstream, server, upstreamName) {
  var extraMessage = upstreamName ? ' from upstream "' + upstreamName + '"' : '';

  var _split = split(server, ':'),
      _split2 = (0, _slicedToArray3.default)(_split, 2),
      ip = _split2[0],
      port = _split2[1];

  if (!port) {
    (0, _process.log)('{{cyan remove}} all servers with ip ' + ip + extraMessage);
    upstream.remove(ip);
    return;
  }

  (0, _process.log)('{{cyan remove}} server ' + ip + ':' + port + extraMessage);
  upstream.remove(ip, port);
}

function split(str, splitter) {
  return str.split(splitter).map(function (x) {
    return x.trim();
  }).filter(Boolean);
}