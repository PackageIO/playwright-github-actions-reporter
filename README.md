# @therootsoft/playwright-github-actions-reporter

A minimal Playwright reporter that prints its package name and version before tests run. After a successful GitHub Actions run, it adds only `result` to the job summary as a success marker.

## Install

```sh
npm install --save-dev @playwright/test @therootsoft/playwright-github-actions-reporter
```

## Configure

Add the reporter to `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
	reporter: [
		['list'],
		['@therootsoft/playwright-github-actions-reporter'],
	],
})
```

At the start of each run, the reporter prints its package name and version.

## Development

```sh
npm install
npm test
```

## Publishing

Configure an npm Trusted Publisher for the `@therootsoft/playwright-github-actions-reporter` package with GitHub Actions as the provider, owner `TheRootSoft`, repository `playwright-github-actions-reporter`, and workflow file `release_package.yml`. The workflow uses GitHub Actions OIDC, so no npm token secret is needed.

For the initial `1.0.0` release, first commit and push the package contents to `main`, then create and push the matching tag:

```sh
git tag v1.0.0
git push origin main --follow-tags
```

For later releases, use `npm version patch`, `npm version minor`, or `npm version major` as appropriate, then push the commit and tag. A pushed `v*` tag starts the release workflow, which verifies that the tag matches `package.json`, runs tests and package checks, publishes the package publicly to npm, and creates a GitHub release.
