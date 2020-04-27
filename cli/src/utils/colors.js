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
    subtle: (...strings) => strings.join(' '),
    pass: (...strings) => strings.join(' '),
    fail: (...strings) => strings.join(' '),
    title: (...strings) => strings.join(' '),
    info: (...strings) => strings.join(' '),
  },
}
