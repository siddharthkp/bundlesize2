const chalk = require('chalk')

module.exports = {
  Colors: {
    subtle: chalk.gray,
    pass: chalk.green,
    fail: chalk.red,
    title: chalk.bold,
    info: chalk.magenta,
  },
  WithoutColors: {
    subtle: value => value,
    pass: value => value,
    fail: value => value,
    title: value => value,
    info: value => value,
  },
}
