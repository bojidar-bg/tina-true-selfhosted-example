import { TinaNodeBackend } from '@tinacms/datalayer'
import { TinaAuthJSOptions, AuthJsBackendAuthProvider } from 'tinacms-authjs'

import express from "express"
import cookieParser from "cookie-parser"

import databaseClient from './__generated__/databaseClient'
import { SimpleMediaHandler } from '@bojidar-bg/tina-simple-media-store/express'
import { config } from './config'
import { gitProvider } from './database'

process.env.NEXTAUTH_URL ||= 'localhost:8080'; // Silence warning in next-auth

export const authOptions = TinaAuthJSOptions({
  databaseClient: databaseClient,
  secret: process.env.NEXTAUTH_SECRET,
})

const authProvider = AuthJsBackendAuthProvider({authOptions})

export const tinaHandler = TinaNodeBackend({
  authProvider,
  databaseClient,
  options: {
    basePath: '/tina/'
  }
})

export const mediaHandler = SimpleMediaHandler({
  authProvider,
  paths: {
    mediaRoot: config.mediaStoreOptions?.mediaRoot ?? '',
    publicFolder: config.build.publicFolder,
    rootPath: gitProvider.options.repoDir,
  },
  onModifyFile: gitProvider.makeCommit
})

export default function createApp() {
  let app = express()
  app.use(cookieParser())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/api/media/', mediaHandler)
  app.use('/api/', tinaHandler)
  return app
};
