const rightpad = require('right-pad')
const figures = require('figures')
const bytes = require('bytes')
const plur = require('plur')
const { Colors, WithoutColors } = require('./colors')

const summarize = (results, cachedResults = [], options = {}) => {
  const colors = options.colors === false ? WithoutColors : Colors
  const baseBranch = options.baseBranch || 'master'

  const status = results.status

  const files = results.files
  const maxFileLength = getMaxFileLength(files)

  let details = ``

  files.forEach(function (row) {
    details += getBlockHeader(row, colors)

    row.filesMatched.forEach(function (file) {
      const cachedFile = cachedResults.find(cached => cached.path === file.path)
      const detailRow = getRow({
        file,
        cachedFile,
        row,
        maxFileLength,
        baseBranch,
        colors,
      })
      details += detailRow
    })
  })

  const cacheSummary = getCacheSummary(results, cachedResults, baseBranch)
  const summary = getSummary(results.counter, colors, cacheSummary)
  const title = getTitle(results.counter, details, summary)

  return { status, details, summary, title }
}

module.exports = summarize

function getMaxFileLength(files) {
  let maxFileLength = 0

  files.forEach(function (row) {
    row.filesMatched.forEach(function (file) {
      if (file.path.length > maxFileLength) maxFileLength = file.path.length
    })
  })

  return maxFileLength
}

function getBlockHeader(row, colors) {
  return ['\n', colors.subtle(`${figures.line} ${row.path}`), '\n'].join('')
}

function getRow({ file, cachedFile, row, maxFileLength, baseBranch, colors }) {
  const symbol = getSymbol(file, colors)
  const diff = getDiffFromCache(file, cachedFile, baseBranch, colors)
  const sizeInfo = getSizeInfo(file, row, colors)

  return [
    ' ',
    symbol,
    rightpad(file.path, Math.min(maxFileLength, 100)),
    '  ',
    sizeInfo,
    diff ? '  ' + diff : null,
    '\n',
  ].join(' ')
}

function getSummary({ pass, fail }, colors, cacheSummary) {
  let line = ``

  if (pass) line += colors.pass(' ', pass, plur('check', pass), 'passed')
  if (pass && fail) line += colors.subtle(',')
  if (fail) line += colors.fail(' ', fail, plur('check', fail), 'failed')

  return line + '   ' + cacheSummary
}

function getCacheSummary(results, cachedResults, baseBranch) {
  if (!cachedResults.length) return ''

  let totalDiff = 0

  results.files.forEach(function (row) {
    row.filesMatched.forEach(function (file) {
      const cachedFile = cachedResults.find(cached => cached.path === file.path)
      if (cachedFile) totalDiff += file.size - cachedFile.size
    })
  })

  let message = ``
  if (totalDiff === 0) message = `same as ${baseBranch}`
  else if (totalDiff > 0) message = `${bytes(totalDiff)} larger than ${baseBranch}`
  else message = `${bytes(-totalDiff)} smaller than ${baseBranch}`

  return message
}

function getTitle(counter, details, summary) {
  // loooool, this is such a hack
  // if there's just one row, we want to show the filename
  // so we read the details string and pick the row out of it

  if (counter.fail === 1) {
    const row = details
      .split('\n')
      .find(row => row.includes(figures.cross))
      .replace(figures.cross, '')
      .trimStart()
    return row
  } else if (counter.pass === 1) {
    const row = details
      .split('\n')
      .find(row => row.includes(figures.tick))
      .replace(figures.tick, '')
      .trimStart()
    return row
  } else return summary
}

function getSymbol(file, colors) {
  if (file.pass) return colors.pass(figures.tick)
  else if (file.skip) return colors.subtle(figures.line)
  else return colors.fail(figures.cross)
}

function getOperator(file, colors) {
  const map = {
    '>': colors.fail('>'),
    '<': colors.pass('<'),
    '=': colors.pass('='),
  }

  return map[file.operator]
}

function getSizeInfo(file, row, colors) {
  if (file.duplicate) return colors.subtle('deduplicated')

  const operator = getOperator(file, colors)
  let compression = row.compression || 'gzip'
  if (compression === 'none') compression = 'no compression'

  return [
    bytes(file.size),
    operator,
    row.maxSize,
    colors.subtle(compression),
  ].join(' ')
}

function getDiffFromCache(file, cachedFile, baseBranch, colors) {
  if (!cachedFile) return ''
  let message = ''

  const diff = file.size - cachedFile.size

  if (diff === 0) message = `same as ${baseBranch}`
  else if (diff > 0) message = `${bytes(diff)} larger than ${baseBranch}`
  else message = `${bytes(-diff)} smaller than ${baseBranch}`

  return colors.subtle(message)
}