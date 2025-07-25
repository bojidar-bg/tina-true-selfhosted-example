import { createDatabase } from '@tinacms/datalayer'

import { ClassicLevel } from 'classic-level'
import { AbstractLevel } from 'abstract-level';
import { SimpleGitProvider } from './simple-git-provider'

export default createDatabase({
  gitProvider: new SimpleGitProvider({
    repoDir: process.env.GIT_REPO_DIR || '.',
    pushRepo: false,
    pullRepo: false,
  }),
  databaseAdapter: new ClassicLevel<string, Record<string, any>>(process.env.LEVELDB_PATH || `_db`, {}) as AbstractLevel<string | Buffer | Uint8Array, string, Record<string, any>>,
})

