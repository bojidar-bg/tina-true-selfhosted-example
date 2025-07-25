import { defineConfig } from "tinacms";
import {
  TinaUserCollection,
  UsernamePasswordAuthJSProvider,
} from 'tinacms-authjs/dist/tinacms'

const branch = process.env.GIT_BRANCH || "main";

export default defineConfig({
  contentApiUrlOverride: '/api/tina/gql',
  branch,
  authProvider: new UsernamePasswordAuthJSProvider(),

  build: {
    publicFolder: "public",
    outputFolder: "admin",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
      static: true,
    },
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
});
