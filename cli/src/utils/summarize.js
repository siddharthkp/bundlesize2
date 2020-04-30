const rightpad = require('right-pad')
const figures = require('figures')
const bytes = require('bytes')
const plur = require('plur')
const { Colors, WithoutColors } = require('./colors')

const summarize = (
  results,
  cachedResults,
  options = { baseBranch: 'master', colors: true }
) => {
  const colors = options.colors === false ? WithoutColors : Colors
  const { baseBranch } = options

  const status = results.status

  const files = results.files
  const maxFileLength = getMaxFileLength(files)

  let details = ``
  files.forEach(function (row) {
    details += getBlockHeader(row, colors)

    row.filesMatched.forEach(function (file) {
      const cachedFile = cachedResults.find(cached => cached.path === file.path)
      details += getRow({
        file,
        cachedFile,
        row,
        maxFileLength,
        baseBranch,
        colors,
      })
    })
  })

  const summary = getSummary(results.counter, colors)

  return { status, details, summary }
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
  const operator = getOperator(file, colors)
  const diff = getDiffFromCache(file, cachedFile, baseBranch, colors)

  return [
    ' ',
    symbol,
    rightpad(file.path, maxFileLength),
    '  ',
    bytes(file.size),
    operator,
    row.maxSize,
    colors.subtle(row.compression || 'gzip'),
    '  ',
    diff,
    '\n',
  ].join(' ')
}

function getSummary({ pass, fail }, colors) {
  let line = ''

  if (pass) line += colors.pass(' ', pass, plur('check', pass), 'passed')
  if (pass && fail) line += colors.subtle(',')
  if (fail) line += colors.fail(' ', fail, plur('check', fail), 'failed')

  return line
}

function getSymbol(file, colors) {
  return file.pass ? colors.pass(figures.tick) : colors.fail(figures.cross)
}

function getOperator(file, colors) {
  const map = {
    '>': colors.fail('>'),
    '<': colors.pass('<'),
    '=': colors.pass('='),
  }

  return map[file.operator]
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
