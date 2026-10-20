# @therootsoft/playwright-github-actions-reporter

A minimal Playwright reporter that prints its package name and version before tests run. After any GitHub Actions run, it adds a concise result to the job summary: `result` on success, or `result: <status>` otherwise.

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
