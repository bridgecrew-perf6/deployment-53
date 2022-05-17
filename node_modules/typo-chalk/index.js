const chalk = require('chalk')

Object.keys(chalk.styles).forEach(name => exports[name] = chalk[name])
