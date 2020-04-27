// get repository from CI environment
const { ci, repo, sha } = require('ci-env')
const fetch = require('node-fetch')

let API = 'https://bundlesize-github-reporter.sid.now.sh'
if (ci === 'custom') API = 'http://localhost:3000'

function report(summary) {
  const body = {
    repo,
    sha,
    title: summary.title,
    summary: summary.title,
    text: summary.details,
  }

  fetch(API, {
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => {
      if (res.status !== 200) {
        res.json().then(json => {
          console.log('⚠️ Could not add check')
          console.log(json.message)
          process.exit(1)
        })
      }
    })
    .catch(error => console.log(error))
}

module.exports = { report }
