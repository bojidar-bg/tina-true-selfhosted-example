import { createDatabase, createLocalDatabase } from '@tinacms/datalayer'

import { SqliteLevel } from 'sqlite-level'
import { SimpleGitProvider } from './simple-git-provider'

// Manage this flag in your CI/CD pipeline and make sure it is set to false in production
const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'

export default isLocal
  ? // If we are running locally, use a local database that stores data in memory and writes to the local filesystem on save
    createLocalDatabase()
  : // If we are not running locally, use a database that stores data in redis and Saves data to github
    createDatabase({
      gitProvider: new SimpleGitProvider({
        repoDir: process.env.GIT_REPO_DIR || '.',
      }),
      databaseAdapter: new SqliteLevel<string, Record<string, any>>({
        filename: process.env.SQLITE_FILE || `/tmp/tina-selfhost.sqlite`,
      }),
      
    })
