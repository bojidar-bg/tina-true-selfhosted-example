import { TinaNodeBackend, LocalBackendAuthProvider } from '@tinacms/datalayer'
import { TinaAuthJSOptions, AuthJsBackendAuthProvider } from 'tinacms-authjs'
import { createServer } from 'node:http'

import databaseClient from '../tina/__generated__/databaseClient'

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'
const port = process.env.PORT || 8080

const handler = TinaNodeBackend({
  authProvider: isLocal
    ? LocalBackendAuthProvider()
    : AuthJsBackendAuthProvider({
        authOptions: TinaAuthJSOptions({
          databaseClient: databaseClient,
          secret: process.env.NEXTAUTH_SECRET,
        }),
      }),
  databaseClient,
})

let server = createServer({}, handler)
server.listen(port, () => {
  console.log(`TinaCMS listening on port ${port}`)
})

