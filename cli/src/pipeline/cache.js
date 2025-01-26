const { ci, repo, branch, sha } = require('ci-env')
const fetch = require('node-fetch')

let API = 'https://bundlesize-cache.now.sh'
if (ci === 'LOCAL') API = 'http://localhost:3001'

const api = {
  get: async ({ repo }) => {
    try {
      const results = await fetch(API + '?repo=' + repo, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      })

      const { filesMatched } = await results.json()
      if (filesMatched && filesMatched.length) return JSON.parse(filesMatched)
      else return []
    } catch (error) {
      console.log('--- bundlesize error ---')
      console.log('Could not get cached values for ' + repo)
      console.log(error)
      console.log('--- bundlesize error ---')
      return []
    }
  },
  put: async ({ repo, branch, sha, filesMatched }) => {
    try {
      await fetch(API, {
        method: 'put',
        body: JSON.stringify({ repo, branch, sha, filesMatched }),
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.log('--- bundlesize error ---')
      console.log('Could not cache values for ' + sha)
      console.log(error)
      console.log('--- bundlesize error ---')
    }
  },
}

const getFilesMatched = ({ files }) => {
  const filesMatched = []

  files.map(rule => {
    rule.filesMatched.map(file => {
      const { path, size } = file
      filesMatched.push({ path, size, rule: rule.path })
    })
  })

  return filesMatched
}

const cache = {
  read: async () => {
    if (!repo || process.env.INTERNAL_SKIP_CACHE) return

    const cachedResults = await api.get({ repo })
    return cachedResults
  },
  save: async ({ files }) => {
    const filesMatched = getFilesMatched({ files })

    await api.put({
      repo,
      branch,
      sha,
      filesMatched: JSON.stringify(filesMatched),
    })

    return true
  },
}

module.exports = cache
