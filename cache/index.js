import 'dotenv/config'
import { sql } from '@vercel/postgres'

module.exports = async (req, res) => {
  const { method } = req

  try {
    if (method === 'GET') {
      console.log('GET', req.query)

      const { repo } = req.query

      if (!repo) {
        const {
          rows: [{ count }],
        } = await sql`SELECT COUNT(*) FROM files`

        return res.json({ message: '200 Okay ' + count })
      } else {
        const { rows } =
          await sql`SELECT * FROM FILES WHERE REPO=${repo} ORDER BY created_at DESC LIMIT 1`

        let filesMatched = []
        if (rows.length) filesMatched = rows[0].filesMatched

        return res.json({ filesMatched })
      }
    } else if (method === 'PUT') {
      const { repo, branch, sha, filesMatched } = req.body
      console.log('PUT', req.body)

      await sql`INSERT INTO FILES (repo, branch, sha, "filesMatched") VALUES(${repo}, ${branch}, ${sha}, ${filesMatched})`
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
