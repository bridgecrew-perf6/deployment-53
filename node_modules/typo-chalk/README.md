[![Build Status](https://travis-ci.org/kaelzhang/typo-chalk.svg?branch=master)](https://travis-ci.org/kaelzhang/typo-chalk)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/typo-chalk?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/typo-chalk)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/typo-chalk.svg)](http://badge.fury.io/js/typo-chalk)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/typo-chalk.svg)](https://www.npmjs.org/package/typo-chalk)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/typo-chalk.svg)](https://david-dm.org/kaelzhang/typo-chalk)
-->

# typo-chalk

chalk helper set for typo 1.x

## Install

```sh
$ npm install typo-chalk --save
```

## Usage

```js
require('typo')()
.use(require('typo-chalk'))
.template(`Once in a {{blue blue}} moon.`)
.then(console.log)

// The word "blue" will be blue
```

## License

MIT
