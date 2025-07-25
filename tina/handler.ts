import { TinaNodeBackend } from '@tinacms/datalayer'
import { TinaAuthJSOptions, AuthJsBackendAuthProvider } from 'tinacms-authjs'

import express from "express"
import cookieParser from "cookie-parser"

import databaseClient from './__generated__/databaseClient'
import { BetterMediaRouter } from './better-media-store-server'
import { config } from './config'
import {gitProvider} from './database'

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

export const mediaHandler = BetterMediaRouter({
  mediaRoot: config.mediaStoreOptions?.mediaRoot ?? '',
  publicFolder: config.build.publicFolder,
  rootPath: gitProvider.options.repoDir,
}, (path) => gitProvider.makeCommit(path))

export default function createApp() {
  let app = express()
  app.use(cookieParser())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/api/media/', mediaHandler)
  app.use('/api/', handler)
  return app
};
