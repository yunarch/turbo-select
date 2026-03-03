import { describe, expect, it } from 'vitest';
import { cliExecutor, TMP_PROJECT_DIR } from '../test-utils';

describe('turbo-select', () => {
  it('should display help information with --help flag', async () => {
    const { stdout } = await cliExecutor(['--help']);
    expect(stdout).toContain('Usage: turbo-select [options]');
    expect(stdout).toContain('--run <script>');
    expect(stdout).toContain('--select-env');
    expect(stdout).toContain('display help for command');
    expect(stdout).toContain('Example usage:');
  });

  it('should fail and throw an error with missing required options', async () => {
    await expect(cliExecutor()).rejects.toThrow(
      "error: required option '--run <script>' not specified"
    );
  });

  it('should throw an error when --run is provided without a value', async () => {
    await expect(cliExecutor(['--run'])).rejects.toThrow(
      "error: option '--run <script>' argument missing"
    );
  });

  it('should throw an error for unknown options', async () => {
    await expect(cliExecutor(['--run', 'dev', '--unknown'])).rejects.toThrow(
      "error: unknown option '--unknown'"
    );
  });

  it('should fail when turbo ls cannot find a turbo project', async () => {
    await expect(cliExecutor(['--run', 'dev'])).rejects.toThrow();
  });

  it('should prompt packages to select', async () => {
    const execution = cliExecutor(['--run', 'dev'], {
      cwd: TMP_PROJECT_DIR,
      encoding: 'utf8',
    });
    const stdout = await new Promise<string>((resolve) => {
      let data = '';
      execution.child.stdout?.on('data', (chunk: Buffer | string) => {
        data += chunk.toString();
        if (data.includes('Select a package to run the script')) {
          execution.child.kill();
          resolve(data);
        }
      });
      execution.child.on('close', () => resolve(data));
      setTimeout(() => {
        execution.child.kill();
        resolve(data);
      }, 10_000);
    });
    expect(stdout).toContain('Turbo-Select');
    expect(stdout).toContain('Select a package to run the script');
    expect(stdout).toContain('@test/app-a');
    expect(stdout).toContain('@test/app-b');
    expect(stdout).toContain('@test/lib-shared');
  }, 10_000);

  it('should prompt environment to select', async () => {
    const execution = cliExecutor(['--run', 'dev', '--select-env'], {
      cwd: TMP_PROJECT_DIR,
      encoding: 'utf8',
    });
    const stdout = await new Promise<string>((resolve) => {
      let data = '';
      let packageSelected = false;
      execution.child.stdout?.on('data', (chunk: Buffer | string) => {
        data += chunk.toString();
        if (
          data.includes('Select a package to run the script') &&
          !packageSelected
        ) {
          packageSelected = true;
          execution.child.stdin?.write('\n');
        }
        if (data.includes('Select a mode to load different env files')) {
          execution.child.kill();
          resolve(data);
        }
      });
      execution.child.on('close', () => resolve(data));
      setTimeout(() => {
        execution.child.kill();
        resolve(data);
      }, 10_000);
    });
    expect(stdout).toContain('Select a mode to load different env files');
    expect(stdout).toContain('development');
    expect(stdout).toContain('staging');
    expect(stdout).toContain('production');
  }, 10_000);
});
