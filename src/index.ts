#!/usr/bin/env node
import { styleText } from 'node:util';
import select from '@inquirer/select';
import { Command } from 'commander';
import spawn from 'nano-spawn';

/**
 * Creates a new instance of the base program with custom help and output configurations.
 *
 * @returns the base program instance.
 */
function createBaseProgram() {
  const program = new Command();
  program
    .configureHelp({
      styleTitle: (str) => styleText('bold', str),
      styleCommandText: (str) => styleText('cyan', str),
      styleCommandDescription: (str) => styleText('magenta', str),
      styleDescriptionText: (str) => styleText('italic', str),
      styleOptionText: (str) => styleText('green', str),
      styleArgumentText: (str) => styleText('yellow', str),
      styleSubcommandText: (str) => styleText('blue', str),
    })
    .configureOutput({
      outputError: (str, write) => {
        write(styleText('red', str));
      },
    });
  return program;
}

/**
 * Prompts the user to select a package from the Turborepo package list.
 *
 * @returns A promise that resolves to the selected package name.
 */
async function selectTurboPackages() {
  const { stdout } = await spawn('turbo', ['ls', '--output=json'], {
    preferLocal: true,
  });
  const { packages } = JSON.parse(stdout.trim()) as {
    packages: { items: { name: string; path: string }[] };
  };
  return await select({
    message: 'Select a package to run the script:',
    choices: packages.items.map((pkg) => pkg.name),
  });
}

/**
 * Prompts the user to select an environment mode (development, staging, production).
 *
 * @returns A promise that resolves to the selected environment mode.
 */
async function selectEnvironmentMode() {
  return await select({
    message: 'Select a mode to load different env files:',
    choices: [
      { name: 'development', value: 'development' },
      { name: 'staging', value: 'staging' },
      { name: 'production', value: 'production' },
    ],
  });
}

// Main program execution
await createBaseProgram()
  .name('turbo-select')
  .description(
    'A CLI tool to filter and select packages from the Turborepo package list and run a script command.\nAdditionally, allow to prompt environment mode (development, staging, production), for example, when using Vite.'
  )
  .requiredOption(
    '--run <script>',
    'The package script command to execute (e.g., --run dev).'
  )
  .option(
    '--env-mode',
    'If should prompt to select environment mode (development, staging, production) to load different env files (e.g., .env.development, .env.staging, .env.production) when using Vite.'
  )
  .addHelpText(
    'after',
    `
Example usage:
${styleText('dim', '$')} \
${styleText('cyan', 'turbo-select')} \
${styleText('green', '--run')} ${styleText('yellow', 'dev')} \
${styleText('green', '--env-mode')}
`
  )
  .action(async ({ run, envMode }: { run: string; envMode?: boolean }) => {
    try {
      console.log(styleText('magenta', '\n🚀 Turbo-Select\n'));
      const filter = await selectTurboPackages();
      const environment = envMode ? await selectEnvironmentMode() : undefined;
      await spawn(
        'turbo',
        [
          'run',
          run,
          '--ui',
          'stream',
          ...(filter ? [`--filter=${filter}`] : []),
          ...(environment ? ['--', '--mode', environment] : []),
        ],
        { preferLocal: true }
      );
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .parseAsync(process.argv);
