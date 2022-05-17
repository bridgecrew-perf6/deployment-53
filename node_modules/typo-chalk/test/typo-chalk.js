const test = require('ava')
const chalk = require('chalk')
const typo = require('typo')
const typo_chalk = require('..')

Object.keys(chalk.styles).forEach((color) => {
  test.cb(`colors: ${color}`, t => {
    const p = typo().use(typo_chalk)
    p.template(`A{{${color} color}}B`)
    .then((string) => {
      t.is(string, `A${chalk[color]('color')}B`)
      t.end()
    })
  })
})
