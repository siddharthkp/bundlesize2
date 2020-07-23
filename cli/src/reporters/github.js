const { ci, repo, sha } = require('ci-env')
const fetch = require('node-fetch')

let API = 'https://bundlesize-github-reporter.now.sh'
// if (ci === 'custom') API = 'http://localhost:3000'

async function report(summary) {
  const { status, title, details } = summary
  const text =
    details > 60000
      ? details.substring(0, 60000) + '… (message truncated)'
      : details

  const body = { repo, sha, status, title, text }

  await fetch(API, {
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
      } else {
        console.log('Added check to GitHub')
      }
    })
    .catch(error => console.log(error))
}

module.exports = { report }
