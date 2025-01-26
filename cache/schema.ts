import 'dotenv/config'
import { default as knex } from 'knex'

const instance = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
})

try {
  await instance.schema.createTable('files', table => {
    table.increments()
    table.string('repo')
    table.string('branch')
    table.string('sha')
    table.string('filesMatched')
    table.timestamps()
    instance.destroy()
  })
} catch (error) {
  instance.destroy()
  throw error
}
