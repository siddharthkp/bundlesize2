#!/usr/bin/env node

const { ci, branch, platform } = require('ci-env')

const files = require('./src/pipeline/files')
const analyse = require('./src/pipeline/analyse')
const cache = require('./src/pipeline/cache')

const cli = require('./src/reporters/cli')
const github = require('./src/reporters/github')
const build = require('./src/reporters/build')
const summarize = require('./src/utils/summarize')

const run = async () => {
  const results = analyse(files)

  if (ci && branch === 'master' && !process.env.INTERNAL_SKIP_CACHE) {
    await cache.save(results)
  }
  const cachedResults = await cache.read()

  const summary = summarize(results, cachedResults)
  cli.report(summary)

  if (ci && platform === 'github') {
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
