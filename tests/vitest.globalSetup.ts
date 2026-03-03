import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import packageJSON from '../package.json' assert { type: 'json' };
import { TMP_PROJECT_DIR } from './test-utils';

const PACKAGES = [
  { name: '@test/app-a', scripts: { dev: 'echo dev', build: 'echo build' } },
  { name: '@test/app-b', scripts: { dev: 'echo dev', build: 'echo build' } },
  { name: '@test/lib-shared', scripts: { build: 'echo build' } },
];

/**
 * Setup function to run before tests.
 */
export async function setup() {
  await writeFile(
    path.join(TMP_PROJECT_DIR, 'package.json'),
    JSON.stringify({
      private: true,
      name: 'mock-project',
      workspaces: ['packages/*'],
      packageManager: packageJSON.packageManager,
    })
  );
  await writeFile(
    path.join(TMP_PROJECT_DIR, 'turbo.json'),
    JSON.stringify({
      $schema: 'https://turborepo.dev/schema.json',
      tasks: {
        dev: {},
        build: { outputs: ['dist/**'] },
      },
    })
  );
  for (const pkg of PACKAGES) {
    const pkgName = pkg.name.split('/')[1];
    const pkgDir = path.join(TMP_PROJECT_DIR, 'packages', pkgName);
    await mkdir(pkgDir, { recursive: true });
    await writeFile(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({
        name: pkg.name,
        version: '1.0.0',
        scripts: pkg.scripts,
      })
    );
  }
}
