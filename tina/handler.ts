import { TinaNodeBackend } from '@tinacms/datalayer'
import { TinaAuthJSOptions, AuthJsBackendAuthProvider } from 'tinacms-authjs'

import express from "express"
import cookieParser from "cookie-parser"

import databaseClient from './__generated__/databaseClient'

process.env.NEXTAUTH_URL ||= 'localhost:8080'; // Silence warning in next-auth

export const authOptions = TinaAuthJSOptions({
  databaseClient: databaseClient,
  secret: process.env.NEXTAUTH_SECRET,
})

export const handler = TinaNodeBackend({
  authProvider: AuthJsBackendAuthProvider({authOptions}),
  databaseClient,
  options: {
    basePath: '/tina/'
  }
})

export default function createApp() {
  let app = express()
  app.use(cookieParser())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/api/', handler)
  return app
};
