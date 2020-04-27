const rightpad = require('right-pad')
const figures = require('figures')
const bytes = require('bytes')
const plur = require('plur')
const colors = require('./colors')

const summarize = results => {
  const status = results.status
  const title = getTitle(results.counter)

  const files = results.files
  const maxFileLength = getMaxFileLength(files)

  let details = ``
  files.forEach(function (row) {
    details += getBlockHeader(row)

    row.filesMatched.forEach(function (file) {
      details += getRow(file, row, maxFileLength)
    })
  })

  return { status, title, details }
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

function getBlockHeader(row) {
  return ['\n', colors.subtle(`${figures.line} ${row.path}`), '\n'].join('')
}

function getRow(file, row, maxFileLength) {
  const symbol = getSymbol(file)
  const operator = getOperator(file)

  return [
    ' ',
    symbol,
    rightpad(file.path, maxFileLength),
    '  ',
    bytes(file.size),
    operator,
    row.maxSize,
    colors.subtle(row.compression || 'gzip'),
    '\n',
  ].join(' ')
}

function getTitle({ pass, fail }) {
  let line

  if (pass) line = colors.pass(' ', pass, plur('check', pass), 'passed')
  if (fail) line = colors.fail(' ', fail, plur('check', fail), 'failed')

  return line + '\n'
}

function getSymbol(file) {
  return file.pass ? colors.pass(figures.tick) : colors.fail(figures.cross)
}

function getOperator(file) {
  const map = {
    '>': colors.fail('>'),
    '<': colors.pass('<'),
    '=': colors.pass('='),
  }

  return map[file.operator]
}
