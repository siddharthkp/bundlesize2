// probably requires type:module in package.json to run

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
    table.text('filesMatched')
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(instance.raw('CURRENT_TIMESTAMP'))
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(instance.raw('CURRENT_TIMESTAMP'))
    instance.destroy()
  })
} catch (error) {
  instance.destroy()
  throw error
}
