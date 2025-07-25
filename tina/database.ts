import { createDatabase } from '@tinacms/datalayer'

import { RaveLevel } from 'rave-level'
import { AbstractLevel } from 'abstract-level';
import { SimpleGitProvider } from './simple-git-provider'

export const gitProvider = new SimpleGitProvider({
  repoDir: process.env.GIT_REPO_DIR || '.',
  pushRepo: false,
  pullRepo: false,
})

export default createDatabase({
  gitProvider,
  databaseAdapter: new RaveLevel<string, Record<string, any>>(process.env.LEVELDB_PATH || `_db`, {}) as AbstractLevel<string | Buffer | Uint8Array, string, Record<string, any>>,
})

