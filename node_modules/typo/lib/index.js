'use strict';

module.exports = typo;

var _require = require('./typo'),
    Typo = _require.Typo,
    OPEN = _require.OPEN,
    CLOSE = _require.CLOSE;

function typo(options) {
  return new Typo(options);
}

typo.Typo = Typo;
typo.OPEN = OPEN;
typo.CLOSE = CLOSE;