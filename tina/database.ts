import { createDatabase } from '@tinacms/datalayer'

import { RaveLevel } from 'rave-level'
import { SimpleGitProvider } from '@bojidar-bg/tina-simple-git-provider'

export const gitProvider = new SimpleGitProvider({
  repoDir: process.env.GIT_REPO_DIR || '.',
  pushRepo: false,
  pullRepo: false,
})

export default createDatabase({
  gitProvider,
  databaseAdapter: new RaveLevel(process.env.LEVELDB_PATH || `_db`, {}) as any,
  // Full type is AbstractLevel<string | Buffer | Uint8Array, string, Record<string, any>>, not spelling it out
})

