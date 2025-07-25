import { DEFAULT_MEDIA_UPLOAD_TYPES, MediaStore, MediaUploadOptions, Media, MediaListOptions, MediaList, TinaCMS, MediaStoreClass, Client } from 'tinacms'

export interface BetterMediaStoreConfig {
  mediaStoreOptions?: {
    mediaApiUrl?: string
    mediaRoot?: string
  }
}
/// A slightly-improved version of [TinaMediaStore], for use in self-hosted deployments
/// Main improvement is the ability to specify a custom url through config.mediaStoreOptions.mediaApiUrl
export class BetterMediaStore implements MediaStore {
  private url: string;
  private mediaRoot: string;

  constructor(cms: Client) {
    let config = cms.schema?.config?.config as BetterMediaStoreConfig | undefined;
    this.url = config?.mediaStoreOptions?.mediaApiUrl ?? '/api/media';
    this.mediaRoot = config?.mediaStoreOptions?.mediaRoot ?? '/';
    this.mediaRoot = this.mediaRoot.replace(/^\/?/, '/').replace(/\/?$/, '/')
  }
  
  get isStatic() {
    return false
  }

  accept = DEFAULT_MEDIA_UPLOAD_TYPES;
  maxSize = 100 * 1024 * 1024; // *Who knows what nginx would let pass...*

  async persist(media: MediaUploadOptions[]): Promise<Media[]> {
    // Mostly copied from TinaMediaStore.persist_local, with light changes around this.mediaRoot
    const newFiles: Media[] = [];

    for (const item of media) {
      const { file, directory } = item;
      // Stripped directory does not have leading or trailing slashes
      let strippedDirectory = directory;
      if (strippedDirectory.startsWith('/')) {
        strippedDirectory = strippedDirectory.substring(1) || '';
      }
      if (strippedDirectory.endsWith('/')) {
        strippedDirectory =
          strippedDirectory.substring(0, strippedDirectory.length - 1) || '';
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', directory);
      formData.append('filename', file.name);

      let uploadPath = `${
        strippedDirectory ? `${strippedDirectory}/${file.name}` : file.name
      }`;
      if (uploadPath.startsWith('/')) {
        uploadPath = uploadPath.substring(1);
      }
      const filePath = `${
        strippedDirectory
          ? `${this.mediaRoot}${strippedDirectory}/${file.name}`
          : this.mediaRoot + file.name
      }`;
      const res = await fetch(`${this.url}/upload/${uploadPath}`, {
        method: 'POST',
        body: formData,
      });

      if (res.status != 200) {
        const responseData = await res.json();
        throw new Error(responseData.message);
      }

      const fileRes = await res.json();
      if (fileRes?.success) {
        const parsedRes: Media = {
          type: 'file',
          id: file.name,
          filename: file.name,
          directory,
          src: filePath,
          thumbnails: {
            '75x75': filePath,
            '400x400': filePath,
            '1000x1000': filePath,
          },
        };
        console.log(parsedRes)

        newFiles.push(parsedRes);
      } else {
        throw new Error('Unexpected error uploading media');
      }
    }
    return newFiles;
  }

  async list(options: MediaListOptions): Promise<MediaList> {
    let res = await fetch(
      `${this.url}/list/${options.directory || ''}?limit=${
        options.limit || 20
      }${options.offset ? `&cursor=${options.offset}` : ''}`
    );

    if (res.status == 404) {
      throw new Error("Cannot access media API");
    }

    if (res.status >= 500) {
      const { e } = await res.json();
      const error = new Error('Unexpected error');
      console.error(e);
      throw error;
    }
    const { cursor, files, directories } = await res.json();

    const items: Media[] = [];
    for (const dir of directories) {
      items.push({
        type: 'dir',
        id: dir,
        directory: options.directory || '',
        filename: dir,
      });
    }

    for (const file of files) {
      items.push({
        directory: options.directory || '',
        type: 'file',
        id: file.filename,
        filename: file.filename,
        src: file.src,
        thumbnails: options.thumbnailSizes?.reduce((acc, { w, h }) => {
          acc[`${w}x${h}`] = file.src;
          return acc;
        }, {}),
      });
    }

    return {
      items,
      nextOffset: cursor || 0,
    };
  }

  async delete(media: Media) {
    const path = `${
      media.directory ? `${media.directory}/${media.filename}` : media.filename
    }`;
    await fetch(`${this.url}/${path}`, {
      method: 'DELETE',
    });
  }
}
