# @packageio/playwright-github-actions-reporter

## Install

```sh
npm install --save-dev @packageio/playwright-github-actions-reporter
```

## Configure

Add the reporter to `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
	reporter: [
		['list'],
		['@packageio/playwright-github-actions-reporter'],
	],
})
```

At the start of each run, the reporter prints its package name and version.

## Development

```sh
npm install
npm test
```

`npm test` generates the Playwright HTML report at `playwright-report/index.html` and the reporter summary at `test-results/reporter-preview.md`. Open the HTML report with `npx playwright show-report`; open the Markdown file with VS Code's Markdown preview. The summary includes test outcome counts and `result` for a passing run, or `result: <status>` otherwise.
