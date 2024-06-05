/**
 * Update the package version
 *
 * - find what kind of version update is this (patch, minor, major)
 * - get the current version in package.json
 * - update the version of package.json
 * - create a git tag with the current version
 * - generate the docs with the current tag as the revision
 */

import { argv, exit } from 'node:process';
import { execSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

type Version = [number, number, number];
type VersionKind = 'patch' | 'minor' | 'major';

const PACKAGE_JSON_PATH = new URL('../package.json', import.meta.url);

await main();

async function main() {
	if (!isWorkingDirectoryClean()) {
		console.error('Commit changes before update the package version');
		exit(1);
	}

	const versionKind = parseVersionKind(argv[2]);
	if (versionKind === null) {
		console.error('Invalid version type:', argv[2]);
		console.error('Valid version types are: "patch" | "minor" | "major"');
		exit(2);
	}

	const version = await syncNewVersion(versionKind);

	// build docs
	const tag = versionTag(version);
	buildDocs(tag);

	const sign = argv.some(arg => arg === '--sign');

	// commit changes
	commitChanges(version, { sign });

	// create git tag
	createGitTag(version, { sign });
}

function isWorkingDirectoryClean(): boolean {
	const cmd = 'git status --porcelain';

	try {
		const out = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
		return out.length === 0;
	} catch (err: unknown) {
		return false;
	}
}

async function syncNewVersion(kind: VersionKind): Promise<Version> {
	try {
		const content = await readFile(PACKAGE_JSON_PATH, 'utf8');
		const packageJson: { version?: string } = JSON.parse(content);

		const version = parseVersion(packageJson.version);
		if (version === null) {
			throw new Error('Unsupported version ' + packageJson.version);
		}

		let [major, minor, patch] = version;

		switch (kind) {
			case 'major': {
				major += 1;
				break;
			}
			case 'minor': {
				minor += 1;
				break;
			}
			case 'patch': {
				patch += 1;
				break;
			}
		}

		const newVersion: Version = [major, minor, patch];

		packageJson.version = versionString(newVersion);
		await writeFile(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, '\t'), 'utf8');

		return newVersion;
	} catch (err: unknown) {
		throw new Error('Could not update "package.json" version', { cause: err });
	}
}

interface GitOptions {
	sign: boolean;
}

function commitChanges(version: Version, options?: Partial<GitOptions>): void {
	const opt = fillGitOptions(options);

	try {
		execSync("git add '*'", { encoding: 'utf8', stdio: 'pipe' });
	} catch (err: unknown) {
		throw new Error('Could not stage changes', { cause: err });
	}

	let cmd = 'git commit --message ' + quoted(versionTag(version) + ' release');
	if (opt.sign) {
		cmd += ' --gpg-sign';
	}

	try {
		execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
	} catch (err: unknown) {
		throw new Error('Could not commit changes', { cause: err });
	}
}

function createGitTag(version: Version, options?: Partial<GitOptions>): void {
	const opt = fillGitOptions(options);
	const tag = versionTag(version);

	let cmd = 'git tag --annotate --message ' + quoted('version ' + versionString(version));
	if (opt.sign) {
		cmd += ' --sign';
	}
	cmd += ' ' + quoted(tag);

	try {
		execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
	} catch (err: unknown) {
		throw new Error('Could not create git tag ' + tag, { cause: err });
	}
}

function fillGitOptions(options?: Partial<GitOptions>): GitOptions {
	return {
		sign: options?.sign ?? false,
	};
}

function buildDocs(gitTag: string): void {
	const cmd = 'npm run build:doc -- --gitRevision ' + gitTag;

	try {
		execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
	} catch (err: unknown) {
		throw new Error('Could not build documentation', { cause: err });
	}
}

function versionTag(version: Version): string {
	return 'v' + versionString(version);
}

function versionString(version: Version): string {
	return version[0] + '.' + version[1] + '.' + version[2];
}

function parseVersion(value: unknown): Version | null {
	if (typeof value !== 'string') {
		return null;
	}

	const [majorStr, minorStr, patchStr] = value.split('.');

	const major = parseInt(majorStr);
	if (isNaN(major)) {
		return null;
	}

	const minor = parseInt(minorStr);
	if (isNaN(minor)) {
		return null;
	}

	const patch = parseInt(patchStr);
	if (isNaN(patch)) {
		return null;
	}

	return [major, minor, patch];
}

function parseVersionKind(value: unknown): VersionKind | null {
	if (value === 'patch' || value === 'fix') {
		return 'patch';
	}

	if (value === 'minor' || value === 'feat' || value === 'feature') {
		return 'minor';
	}

	if (value === 'major' || value === 'break') {
		return 'major';
	}

	return null;
}

function quoted(value: string): string {
	return "'" + value + "'";
}
