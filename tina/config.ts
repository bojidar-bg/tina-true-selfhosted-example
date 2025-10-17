import { Config, defineConfig, MediaStoreClass, wrapFieldsWithMeta } from "tinacms";
import {
  TinaUserCollection,
  UsernamePasswordAuthJSProvider,
} from "tinacms-authjs/dist/tinacms"
import { SimpleMediaStoreConfig } from "@bojidar-bg/tina-simple-media-store"
import { MDXEditorField } from "@bojidar-bg/tina-mdx-editor"

const branch = process.env.GIT_BRANCH || "main";

export const config: SimpleMediaStoreConfig & Config<undefined, undefined, undefined, MediaStoreClass> = {
  contentApiUrlOverride: "/api/tina/gql",
  branch,
  authProvider: new UsernamePasswordAuthJSProvider(),

  build: {
    publicFolder: "public",
    outputFolder: "admin",
  },
  media: {
    loadCustomStore: async () => (await import("@bojidar-bg/tina-simple-media-store")).SimpleMediaStore,    
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
            type: "string",
            name: "body",
            label: "Body",
            isBody: true,
            ui: {
              component: wrapFieldsWithMeta(MDXEditorField) as any
            }
          },
        ],
      },
    ],
  },
}

// HACK: Tina doesn't process CSS includes from the config correctly (..they do work if they are part of external packages, however), so we create the <style> tag manually
if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.innerHTML = `
  /* Undo Tina's CSS reset within the .mdxeditor-rich-text-editor - so that the WYSIWYG editor has the same (lack of) theme as the real page */
  body :where(.mdxeditor-rich-text-editor) :is(a, abbr, audio, b, blockquote, button, canvas, code, dd, dl, embed, fieldset, figure, h1, h2, h3, h4, h5, h6, hr, hr, iframe, img, input, kbd, legend, li:before, menu, object, ol, optgroup, p, pre, progress, samp, select, small, strong, sub, summary, sup, svg, table, textarea, textarea::placeholder, ul, video) {
    color: revert;
    display: revert;
    font-family: revert;
    font-size: revert;
    font-weight: revert;
    height: revert;
    line-height: revert;
    list-style: revert;
    margin: revert;
    max-width: revert;
    padding: revert;
    position: revert;
    text-decoration: revert;
    top: revert;
    vertical-align: revert;
  }
  `;
  document.head.appendChild(s);
}

export default defineConfig(config);
