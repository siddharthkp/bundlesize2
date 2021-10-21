/*
This file is not important, it is just an uncompressed version of the neighbouring precompressed file.

The precompressed file is 220B.

*/

const { inspect } = require('util')
const files = require('./src/files')
const reporter = require('./src/reporter')
const build = require('./src/build')

reporter(files)

process.on('unhandledRejection', function(reason) {
  console.log('Unhandled Promise')
  console.log(inspect(reason))
  build.error()
})
