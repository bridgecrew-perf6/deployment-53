#!/usr/bin/env node
'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _process = require('../util/process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version(require('../../package.json').version).usage('<cmd> [options]').option('-v, --nginx-version', 'show nginx version').command('build', 'build nginx config').command('test', 'test nginx config').command('reload', 'reload nginx server').command('start', 'start nginx server').command('stop', 'stop nginx server').command('restart', 'restart (stop and start) nginx server').command('down <ip>:<port>', 'remove a upstream server').command('list [upstream]', 'list all upstreams').parse(process.argv);

if (_commander2.default.nginxVersion) {
  (0, _process.spawn)('nginx', ['-v']).then(function () {
    console.log('ngx version: ngx/' + require('../../package.json').version);
  }).catch(_process.fail);
}