#!/usr/bin/env node

const { ci, branch, platform } = require('ci-env')

const { flags } = require('./src/pipeline/config')
const files = require('./src/pipeline/files')
const markDuplicates = require('./src/pipeline/mark-duplicates')
const analyse = require('./src/pipeline/analyse')
const cache = require('./src/pipeline/cache')

const cli = require('./src/reporters/cli')
const github = require('./src/reporters/github')
const build = require('./src/reporters/build')
const summarize = require('./src/utils/summarize')
const debug = require('./src/utils/debug')

const run = async () => {
  const results = analyse(markDuplicates(files))

  debug('cache if', { ci, branch, skip: !process.env.INTERNAL_SKIP_CACHE })
  if (
    ci &&
    (branch === 'main' || branch === 'master') &&
    !process.env.INTERNAL_SKIP_CACHE
  ) {
    debug('before cache.save', results)
    await cache.save(results)
  }
  const cachedResults = await cache.read()
  debug('cache.read', cachedResults)

  const summary = summarize(results, cachedResults)
  cli.report(summary)

  if (ci && flags.enableGitHubChecks) {
    const summaryWithoutColors = summarize(results, cachedResults, {
      colors: false,
    })
    await github.report(summaryWithoutColors)
  }
  build.report(summary)
}

try {
  run()
} catch (err) {
  build.error(err)
}
