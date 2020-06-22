let debugMode = false
if (process.argv.indexOf('--debug') !== -1) debugMode = true

const debug = (label, data) => {
  if (debugMode)
    console.log(`DEBUG: ${label}: ${JSON.stringify(data, null, 2)}\n`)
}

module.exports = debug
