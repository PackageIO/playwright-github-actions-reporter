# @therootsoft/playwright-github-actions-reporter

A minimal Playwright reporter that prints its package name and version before tests run. After a successful GitHub Actions run, it adds only `result` to the job summary as a success marker.

## Install

```sh
npm install --save-dev @therootsoft/playwright-github-actions-reporter
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
