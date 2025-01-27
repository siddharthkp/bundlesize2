<p align="center">
  <img src="https://cdn.rawgit.com/siddharthkp/bundlesize/master/art/logo.png" height="100px">
  <br><br>
  <b>bundlesize - version 2 preview</b>
  <br><br>
  <img src="https://img.shields.io/badge/status-preview-yellow?style=flat"/>
</p>

&nbsp;

Jump to:

- [Migration from bundlesize@0.18.0](#migration-from-bundlesize0180)
- [Setup](#setup)
- [Usage](#usage)
- [Configuration](#configuration)
- [Build status and Checks for GitHub](#build-status-and-checks-for-github)


&nbsp;

#### Setup

```sh
npm install bundlesize2 --save-dev

# or

yarn add bundlesize2 --dev
```

&nbsp;

#### Usage

&nbsp;

Add it to your scripts in `package.json`

```json
"scripts": {
  "test": "bundlesize"
}
```

Or you can use it with `npx` from [NPM 5.2+](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b).

```sh
npx bundlesize2
```

&nbsp;

#### Configuration

&nbsp;

1. Option 1: Create a `bundlesize.config.json` (recommended)

Format:

```json
{
  "files": [
    {
      "path": "./build/vendor.js",
      "maxSize": "30 kB"
    },
    {
      "path": "./build/chunk-*.js",
      "maxSize": "10 kB"
    }
  ]
}
```

The file is expected to be at the project root. But, you can give a different path by using the `--config` flag:

```
bundlesize --config configs/bundlesize.json
```

Option 2: You can also put the config in `package.json`

```json
{
  "name": "your cool library",
  "version": "1.1.2",
  "bundlesize": [
    {
      "path": "./build/vendor.js",
      "maxSize": "3 kB"
    }
  ]
}
```

Notice that the key here is `bundlesize` instead of `files`.

&nbsp;

#### Customisation

&nbsp;

1. Fuzzy matching

   If the names of your build files are not predictable, you can use the [glob pattern](https://github.com/isaacs/node-glob) to specify files.

   This is common if you append a hash to the name.

   ```json
   {
     "files": [
       {
         "path": "build/**/main-*.js",
         "maxSize": "5 kB"
       },
       {
         "path": "build/**/*.chunk.js",
         "maxSize": "50 kB"
       }
     ]
   }
   ```

   It will match multiple files if necessary and create a new row for each file.

   &nbsp;

2. Compression options

   By default, bundlesize `gzips` your build files before comparing.

   If you are using `brotli` instead of gzip, you can specify that with each file:

   ```json
   {
     "files": [
       {
         "path": "./build/vendor.js",
         "maxSize": "5 kB",
         "compression": "brotli"
       }
     ]
   }
   ```

   If you do not use any compression before sending your files to the client, you can switch compression off:

   ```json
   {
     "files": [
       {
         "path": "./build/vendor.js",
         "maxSize": "5 kB",
         "compression": "none"
       }
     ]
   }
   ```

&nbsp;

#### Build status and Checks for GitHub

&nbsp;

If your repository is hosted on GitHub, you can set bundlesize up to create a "check" on every pull request.

![build status](https://cdn.rawgit.com/siddharthkp/bundlesize/master/art/status.png)

To enable checks,

1. Run `bundlesize` with the flag `bundlesize --enable-github-checks`.
2. [authorize `bundlesize` to add checks](https://github.com/apps/bundlesize2) (Does not need access to your code)

Checks work with [GitHub Actions](https://github.com/features/actions), [Travis CI](https://travis-ci.org), [CircleCI](https://circleci.com/), [Wercker](http://www.wercker.com), and [Drone](http://readme.drone.io/).

Using a different CI? You will need to supply an additional 5 environment variables.

- `CI_REPO_OWNER` given the repo `https://github.com/myusername/myrepo` would be `myusername`
- `CI_REPO_NAME` given the repo `https://github.com/myusername/myrepo` would be `myrepo`
- `CI_COMMIT_MESSAGE` the commit message
- `CI_COMMIT_SHA` the SHA of the CI commit, in [Jenkins](https://jenkins.io/) you would use `${env.GIT_COMMIT}`
- `CI=true` usually set automtically in CI enviroments

&nbsp;

#### Migration from bundlesize@0.18.0

1. Use the npm package `bundlesize2` instead of `bundlesize`
2. If you'd like status reported back to github, use the flag `--enable-github-checks` + authorize bundlesize2 app. [More in the docs](https://github.com/siddharthkp/bundlesize2#build-status-and-checks-for-github)
3. Remove `BUNDLESIZE_GITHUB_TOKEN`, it's not required anymore
4. If anything breaks, let me know :)

Note: When this package is feature complete, it will be merged back into the original project as bundlesize@2.0.0

&nbsp;

#### license

MIT © [siddharthkp](https://github.com/siddharthkp)
