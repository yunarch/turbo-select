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
  const { output } = await spawn('turbo', ['ls']);
  const packageList = output
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(' ')[0]);
  return await select({
    message: 'Select a package to run the script:',
    choices: packageList.map((opt) => ({ name: opt, value: opt })),
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
    'A CLI tool to filter and select a single package from the Turborepo package list and run a script command.\nAdditionally, allow to prompt environment mode (development, staging, production), for example, when using Vite.'
  )
  .requiredOption(
    '--run <script>',
    'The package script command to execute (e.g., --run=dev).'
  )
  .option(
    '--select-env',
    'An environment mode (development, staging, production) If using for example vite.'
  )
  .addHelpText(
    'after',
    `
Example usage:
${styleText('dim', '$')} \
${styleText('cyan', 'turbo-select')} \
${styleText('green', '--run')} ${styleText('yellow', 'dev')} \
${styleText('green', '--select-env')}
`
  )
  .action(async ({ run, selectEnv }: { run: string; selectEnv?: boolean }) => {
    try {
      console.log(styleText('magenta', '\n🚀 Turbo-Select\n'));
      const filter = await selectTurboPackages();
      const environment = selectEnv ? await selectEnvironmentMode() : undefined;
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
        {
          stdio: 'inherit',
        }
      );
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .parseAsync(process.argv);
