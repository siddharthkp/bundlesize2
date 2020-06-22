const { Colors } = require('./colors')

const error = message => {
  console.log(Colors.fail(message))
  process.exit(1)
}

module.exports = error
