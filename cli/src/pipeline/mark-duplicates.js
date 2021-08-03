const debug = require('../utils/debug')

const markDuplicates = config => {
  // 1. attach specificity score to each rule
  // 2. attach index to each rule before sorting
  // 3. reverse sort by specificity
  // 4. mark matching files as duplicate in other rules after current
  // 5. sort them back to their initial positions

  config.files.forEach(rule => {
    rule.specificity = calculateSecificity(rule.path)
  })

  config.files.forEach((rule, index) => (rule.initialIndex = index))
  config.files.sort((a, b) => {
    // deterministic sort
    if (b.specificity === a.specificity) return b.initialIndex - a.initialIndex
    else return b.specificity - a.specificity
  })

  config.files.forEach((ruleA, indexA) => {
    ruleA.filesMatched.forEach(fileA => {
      // find in other rules
      config.files.forEach((ruleB, indexB) => {
        if (indexB <= indexA) return // only for next rules
        ruleB.filesMatched.forEach(fileB => {
          if (fileA.path === fileB.path && ruleA.compression === ruleB.compression) fileB.duplicate = true
        })
      })
    })
  })

  config.files.sort((a, b) => a.initialIndex - b.initialIndex)
  config.files.forEach(rule => delete rule.initialIndex)

  debug('config with duplicates marked', config)

  return config
}

module.exports = markDuplicates

// i completely made this up, but it does the job well
// for a given path, 'build/**/chunk-*.js',
// specificity is calculated as
// 100 * number of / seperated parts + length of last part
const calculateSecificity = path => {
  const parts = path.split('/')
  const last = parts.pop()
  const score = 100 * parts.length + last.length
  return score
}
