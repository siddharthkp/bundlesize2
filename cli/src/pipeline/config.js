const cosmiconfig = require('cosmiconfig')
const program = require('commander')
const fs = require('fs')
const debug = require('../utils/debug')
const error = require('../utils/error')

// default places we check
const configPaths = ['package.json', 'bundlesize.config.json']

/* Config + Flags from CLI */
program
  .option('--config [config]', 'Get path of configuration file')
  .option('--debug', 'run in debug mode')
  .option(
    '--enable-github-checks',
    'Enable checks on GitHub (needs installation)'
  )
  .option('-f, --files [files]', '(legacy) files to test against (dist/*.js)')
  .option('-s, --max-size [maxSize]', '(legacy) maximum size threshold (3Kb)')
  .option(
    '-c, --compression [compression]',
    '(legacy) specify which compression algorithm to use'
  )
  .parse(process.argv)

let configFromCli

if (program.config) {
  if (!fs.existsSync(program.config)) {
    // throw error if file doesn't exist
    error(
      `
Custom config file does not exist. Make sure the path is relative to the project root.

You can read about the configuration options here:
https://github.com/siddharthkp/bundlesize#configuration
    `
    )
  } else {
    // add to the list of files to check at the 1st position
    configPaths.unshift(program.config)
  }
}

if (program.files) {
  configFromCli = [
    {
      path: program.files,
      maxSize: program.maxSize,
      compression: program.compression || 'gzip',
    },
  ]
}

/* Config from file */

let configFromFile

const explorer = cosmiconfig('bundlesize', { searchPlaces: configPaths })
const result = explorer.searchSync()

if (result) {
  if (result.filepath.includes('package.json')) configFromFile = result.config
  else configFromFile = result.config.files
}

/* Send to readme if no configuration is provided */

if (!configFromFile && !configFromCli) {
  error(
    `
Config not found.

You can read about the configuration options here:
https://github.com/siddharthkp/bundlesize#configuration
  `
  )
}

const files = configFromCli || configFromFile

debug('config from cli params', configFromCli)
debug('config from bundlesize.config', configFromFile)
debug('selected config', files)

const flags = {
  debug: program.debug,
  enableGitHubChecks: program.enableGithubChecks,
}

module.exports = { files, flags }
