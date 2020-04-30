require('dotenv').config()
const express = require('express')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

var knex = require('knex')({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
})

async function testConnection() {
  const result = await knex.select(1)
  console.log('Connection test', result)
  return result
}

testConnection()

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('200 Okay')
})

app.get('/cache/:owner/:repo', async (req, res) => {
  console.log('GET', req.params)
  const repo = req.params.owner + '/' + req.params.repo

  const _rows = await knex
    .table('files')
    .select()
    .where('repo', repo)
    .orderBy('created_at', 'desc')
    .limit(1)

  let filesMatched = {}
  if (_rows.length) filesMatched = _rows[0].filesMatched

  res.json({ filesMatched })
})

app.put('/cache', async (req, res) => {
  const { repo, branch, sha, filesMatched } = req.body
  console.log('PUT', req.body)
  await knex('files').returning('*').insert({ repo, branch, sha, filesMatched })
  res.json({ message: 'Cached' })
})

app.listen(3001)
