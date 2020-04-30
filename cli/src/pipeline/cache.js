const { ci, repo, branch, sha } = require('ci-env')
const fetch = require('node-fetch')

let API = 'https://bundlesize-cache.now.sh'
// if (ci === 'custom') API = 'http://localhost:3001'

const api = {
  get: async ({ repo }) => {
    return await fetch(API + '?repo=' + repo, {
      method: 'get',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(json => {
        if (json.filesMatched && json.filesMatched.length) {
          return JSON.parse(json.filesMatched)
        } else return []
      })
      .catch(error => console.log(error))
  },
  put: async ({ repo, branch, sha, filesMatched }) => {
    return await fetch(API, {
      method: 'put',
      body: JSON.stringify({ repo, branch, sha, filesMatched }),
      headers: { 'Content-Type': 'application/json' },
    }).catch(error => {
      console.log('Could not cache values for ' + sha)
      console.log(error)
    })
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
    if (!repo) return

    const cachedResults = await api.get({ repo })
    return cachedResults
  },
  save: async ({ files }) => {
    const filesMatched = getFilesMatched({ files })

    try {
      await api.put({
        repo,
        branch,
        sha,
        filesMatched: JSON.stringify(filesMatched),
      })
    } catch (error) {
      console.log(error)
    }

    return true
  },
}

module.exports = cache
