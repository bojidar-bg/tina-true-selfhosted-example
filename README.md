# TinaCMS *True* Self-hosted example

This is an example repository exploring a way of achieving an truly-self-hosted TinaCMS-powered website, which doesn't depend on centralized cloud services like GitHub, Vercel, Netlify, Cloudinary, and the like. Not for the faint of heart, but if you are frustrated with the way TinaCMS has been skirting around self-hosting with instructions for running things on top of non-self-hostable services, this repository might be for you!

To achieve this, we use:

* [`@bojidar-bg/tina-simple-git-provider`](https://www.npmjs.com/package/@bojidar-bg/tina-simple-git-provider) to access a local fork of a repository instead of depending on GitHub for repository hosting.
* [`@bojidar-bg/tina-simple-media-store`](https://www.npmjs.com/package/@bojidar-bg/tina-simple-media-store), a light reimplementation of Tina's MediaStore to workaround [tinacms/tinacms#4486](https://github.com/tinacms/tinacms/issues/4486)
* [`rave-level`](https://www.npmjs.com/package/rave-level) to store a local database (see [`database.ts`](./tina/database.ts)), with a hacky workaround for [tinacms/tinacms#4492](https://github.com/tinacms/tinacms/issues/4492) (see [`patch-tina-cli.sh`](./patch-tina-cli.sh))
* [`express`](https://expressjs.com/) for hosting the backend (see [`handler.ts`](./tina/handler.ts))
* [11ty / Eleventy](https://www.11ty.dev/) for building the static website (see [`eleventy.config.mjs`](./eleventy.config.mjs))
* [`@bojidar-bg/tina-mdx-editor`](https://www.npmjs.com/package/@bojidar-bg/tina-mdx-editor) to have a more featureful markdown editor compared to the built-in Tina rich-text editor - you can probably remove that when adapting this example to your own usecase.

In particular, we don't use TinaCMS's local mode, and instead run everything locally the same way we would run it in production.

## Running the example

To run this example locally, you can clone the repository, then run:

```bash
cp .env.example .env

npm install

npm run build
npm run serve
```

Then, if you open `localhost:8080` (Eleventy's default port), you should be greeted by the working example.

Login is `admin` / `admin` - you will be prompted to change your password as soon as you sign in.

## Adapting the example for production use

If you want to use this example in production, please make a copy of the repository and adapt at will!

The main things you want to change in the code are:

* `tina/config.ts`: You should configure your own collections here.
* `tina/database.ts`: Consider changing the options passed to `SimpleGitProvider`, especially `pushRepo`, `pullRepo`, and `cloneRepo`, so that they would fit your usecase.
* `eleventy.config.mjs`: You can probably swap this out for a different build system, or just configure to fit your needs.
* `tina/server.ts`: If you are behind a proxy like `nginx`, you can probably remove the `express.static()` line.

Then, you should consider configuring the following environment variables (either through `.env` or through your deployment pipeline):

* `AUTH_SECRET` - should be a random value, e.g. from something like `openssl rand -base64 32`.
* `LEVELDB_PATH` - should be a path to a persisted directory where TinaCMS stores its data (such as users).
* `GIT_REPO` - set this to a path to a git repository, as descibed below.

Finally, to run the server-side component without watching for changes, you can use:

```bash
npm run clean-build # Rebuild the site

npm run serve
```

### Setting up bare git repositories and hooks for production use

In a production setting where you are pushing to a bare Git repository over SSH, you would want to have three git repositories set up:

* The bare repository, which is what you are going to use to push to the server.
* The build repository, which is where the website is built from.
* The edit repository, which is what the TinaCMS backend is allowed to edit. This is what the `GIT_REPO` environment variable should point to.

In terms of hooks, you want:
* A `post-receive` hook on the bare repository which automatically pulls the new changes into the other two repositories.
* A `post-merge` hook on the build repository which automatically rebuilds the static site (and likely also restarts the running TinaCMS backend).

To set all of this up, you could use a variation of the below:

```bash
# On the server you are deploying to:

git init --bare bare/

# Locally, to upload your current code to the newly-created bare repository:

git remote add deploy ssh://USER@SERVER/path/to/bare/
git push -u deploy main

# Then, back to the server you are deploying to:

git clone ./bare/ ./build/
git clone ./bare/ ./edit/

cat > ./bare/hooks/post-receive <<HERE
#!/bin/sh

echo Updating repositories...
GIT_WORK_TREE=$(pwd)/edit GIT_DIR=$(pwd)/edit/.git git pull
GIT_WORK_TREE=$(pwd)/build GIT_DIR=$(pwd)/build/.git git pull
HERE
chmod u+x ./bare/hooks/post-receive

cat > ./build/.git/hooks/post-merge <<HERE
#!/bin/sh

if git show --no-patch | grep -E '\[(skip-ci|skip|no-update)\]'; then
  exit
fi

echo Rebuilding...

npm install

npm run build # or npm run clean-build
HERE
chmod u+x ./build/.git/hooks/post-merge
```

Both the build and edit repositories may be shallow clones or work trees if you prefer doing that; figuring out the specifics of this is left as an exercise to the reader.

## What's missing

This example, while serving as a potential starting point for setting up a truly self-hosted TinaCMS server, is only a proof of concept. It has not been ran in production yet.

