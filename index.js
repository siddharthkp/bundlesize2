#!/usr/bin/env node

const files = require('./src/pipeline/files')
const analyse = require('./src/pipeline/analyse')

const cli = require('./src/reporters/cli')
const github = require('./src/reporters/github')
const build = require('./src/reporters/build')

try {
  const results = analyse(files)
  cli.report(results)
  build.report(results)
} catch (err) {
  build.error(err)
}
