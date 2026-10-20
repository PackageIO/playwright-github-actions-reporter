import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import GitHubActionsReporter from '../dist/index.js';

const packageMetadata = createRequire(import.meta.url)('../package.json');
const require = createRequire(import.meta.url);

test('resolves the package name for Playwright reporter lookup', () => {
	assert.equal(
		require.resolve('@therootsoft/playwright-github-actions-reporter'),
		require.resolve('../dist/index.js'),
	);
});

test('prints its package name and version when the run begins', () => {
	const reporter = new GitHubActionsReporter();
	const originalWrite = process.stdout.write;
	let output = '';
	process.stdout.write = (chunk) => {
		output += String(chunk);
		return true;
	};
	try {
		reporter.onBegin({}, { allTests: () => [] });
	} finally {
		process.stdout.write = originalWrite;
	}

	assert.equal(output, `${packageMetadata.name} v${packageMetadata.version}\n`);
});

test('writes only the result marker to the GitHub Actions summary on success', async () => {
	const directory = await mkdtemp(path.join(os.tmpdir(), 'playwright-gh-reporter-'));
	const summaryPath = path.join(directory, 'summary.md');
	const previousGitHubActions = process.env.GITHUB_ACTIONS;
	const previousSummaryPath = process.env.GITHUB_STEP_SUMMARY;
	process.env.GITHUB_ACTIONS = 'true';
	process.env.GITHUB_STEP_SUMMARY = summaryPath;
	const reporter = new GitHubActionsReporter();
	try {
		await reporter.onEnd({ status: 'passed' });
		assert.equal(await readFile(summaryPath, 'utf8'), 'result\n');
	} finally {
		if (previousGitHubActions === undefined) delete process.env.GITHUB_ACTIONS;
		else process.env.GITHUB_ACTIONS = previousGitHubActions;
		if (previousSummaryPath === undefined) delete process.env.GITHUB_STEP_SUMMARY;
		else process.env.GITHUB_STEP_SUMMARY = previousSummaryPath;
		await rm(directory, { recursive: true, force: true });
	}
});

test('writes the run status to the GitHub Actions summary for every non-passing outcome', async () => {
	const previousGitHubActions = process.env.GITHUB_ACTIONS;
	const previousSummaryPath = process.env.GITHUB_STEP_SUMMARY;
	try {
		process.env.GITHUB_ACTIONS = 'true';
		for (const status of ['failed', 'timedout', 'interrupted']) {
			const directory = await mkdtemp(path.join(os.tmpdir(), 'playwright-gh-reporter-'));
			const summaryPath = path.join(directory, 'summary.md');
			process.env.GITHUB_STEP_SUMMARY = summaryPath;
			try {
				await new GitHubActionsReporter().onEnd({ status });
				assert.equal(await readFile(summaryPath, 'utf8'), `result: ${status}\n`);
			} finally {
				await rm(directory, { recursive: true, force: true });
			}
		}
	} finally {
		if (previousGitHubActions === undefined) delete process.env.GITHUB_ACTIONS;
		else process.env.GITHUB_ACTIONS = previousGitHubActions;
		if (previousSummaryPath === undefined) delete process.env.GITHUB_STEP_SUMMARY;
		else process.env.GITHUB_STEP_SUMMARY = previousSummaryPath;
	}
});