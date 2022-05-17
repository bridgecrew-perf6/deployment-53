#!/usr/bin/env node
'use strict';

var _commander = require('../util/commander');

var _process = require('../util/process');

var _ = require('..');

(0, _.parseOptions)((0, _commander.parse)()).then(_.build).catch(_process.fail);