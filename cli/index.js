#!/usr/bin/env node

const { ci, platform } = require('ci-env')

const files = require('./src/pipeline/files')
const analyse = require('./src/pipeline/analyse')

const cli = require('./src/reporters/cli')
const github = require('./src/reporters/github')
const build = require('./src/reporters/build')
const summarize = require('./src/utils/summarize')

try {
  const results = analyse(files)
  const summary = summarize(results)
  cli.report(summary)

  if (ci && platform === 'github') {
    const summaryWithoutColors = summarize(results, { colors: false })
    github.report(summaryWithoutColors)
  }
  build.report(summary)
} catch (err) {
  build.error(err)
}
