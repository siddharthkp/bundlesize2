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

module.exports = async (req, res) => {
  const { method } = req

  try {
    if (method === 'GET') {
      console.log('GET', req.query)
      const { repo } = req.query

      if (!repo) {
        return res.json({ message: '200 Okay' })
      } else {
        const _rows = await knex
          .table('files')
          .select()
          .where('repo', repo)
          .orderBy('created_at', 'desc')
          .limit(1)

        let filesMatched = {}
        if (_rows.length) filesMatched = _rows[0].filesMatched

        return res.json({ filesMatched })
      }
    } else if (method === 'PUT') {
      const { repo, branch, sha, filesMatched } = req.body
      console.log('PUT', req.body)
      await knex('files')
        .returning('*')
        .insert({ repo, branch, sha, filesMatched })

      return res.json({ message: 'Cached' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: `
        Something broke pretty bad!

        Please create an issue with this error message: ${error}
    `,
    })
  }
}
