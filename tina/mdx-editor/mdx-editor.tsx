import React, { useRef } from 'react';
import { BlockTypeSelect, BoldItalicUnderlineToggles, Button, CreateLink, DiffSourceToggleWrapper, InsertThematicBreak, ListsToggle, MDXEditor, UndoRedo, diffSourcePlugin, headingsPlugin, iconComponentFor$, imagePlugin, insertImage$, linkDialogPlugin, linkPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, toolbarPlugin, useCellValues, usePublisher } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

import { useCMS } from 'tinacms';
  
export function MDXEditorField({input, meta}) {
  const overlay = useRef(null);
  return <>
    {overlay.current && <MDXEditor
      overlayContainer={overlay.current}
      markdown={input.value}
      plugins={[
        headingsPlugin(),
        quotePlugin(),
        listsPlugin(),
        thematicBreakPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <CreateLink />
              <InsertTinaImage />
              <ListsToggle options={['bullet', 'number']} />
              <InsertThematicBreak />
              <UndoRedo />
              <DiffSourceToggleWrapper children={[]} />
            </>
          )
        }),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin({
          imageUploadHandler: null,
          allowSetImageDimensions: true
        }),
        diffSourcePlugin({
          diffMarkdown: meta.initial
        })
      ]}
      onChange={input.onChange}
    />}
    <div ref={overlay}></div>
  </>;
};

export function InsertTinaImage({}) {
  const cms = useCMS();
  const [iconComponentFor] = useCellValues(iconComponentFor$);
  const insertImage = usePublisher(insertImage$);
  return (<Button
      onClick={() => {
        cms.media.open({
          allowDelete: true,
          directory: '',
          onSelect: (media) => {
            insertImage({src: media.src!});
          },
        });
      }}>
      {iconComponentFor("add_photo")}
    </Button>);
}

// HACK: Tina doesn't process CSS includes from the config correctly (..they do work if they are part of external packages, however), so we create the style manually
if (typeof document !== 'undefined') {
  let s = document.createElement('style');
  s.innerHTML = `
  /* Undo Tina's CSS reset within the .mdxeditor-rich-text-editor - so the WYSIWYG editor has the same (lack of) theme as the real page */
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
  /* Replicate some of Tina's field styling */
  .mdxeditor-diff-source-wrapper {
    box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
    padding: 12px 8px;
    background-color: white;
    border: 1px solid rgb(225 221 236);
    border-radius: 4px;
  }
  `;
  document.head.appendChild(s);
}

export default MDXEditorField;
