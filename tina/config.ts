import { Config, defineConfig, DocumentCreatorCallback, MediaStoreClass, TinaCMS } from "tinacms";
import {
  TinaUserCollection,
  UsernamePasswordAuthJSProvider,
} from 'tinacms-authjs/dist/tinacms'
import { formifyCallback } from "tinacms/dist/hooks/use-graphql-forms";
import { BetterMediaStoreConfig } from "./better-media-store";

const branch = process.env.GIT_BRANCH || "main";

export const config: BetterMediaStoreConfig & Config<(cms: TinaCMS) => TinaCMS, formifyCallback, DocumentCreatorCallback, MediaStoreClass> = {
  contentApiUrlOverride: '/api/tina/gql',
  branch,
  authProvider: new UsernamePasswordAuthJSProvider(),

  build: {
    publicFolder: "public",
    outputFolder: "admin",
  },
  media: {
    loadCustomStore: async () => (await import("./better-media-store")).BetterMediaStore,    
  },
  mediaStoreOptions: {
    mediaRoot: "uploads"
  },
  schema: {
    collections: [
      TinaUserCollection,
      {
        name: "post",
        label: "Posts",
        path: "content/posts",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
}
export default defineConfig(config);
