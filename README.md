<h1>@yunarch/turbo-select</h1>

A CLI tool to filter and select packages from the Turborepo package list and run a script command.

Additionally, allow to prompt environment mode (development, staging, production), for example, when using Vite.

> [!NOTE]
> CLI extracted from https://github.com/yunarch/config-web. keeping it around in case someone still finds it useful.

## Usage

<!-- [docsgen]: start -->

```
Usage: turbo-select [options]

A CLI tool to filter and select packages from the Turborepo package list and run
a script command.
Additionally, allow to prompt environment mode (development, staging,
production), for example, when using Vite.

Options:
  --run <script>  The package script command to execute (e.g., --run dev).
  --env-mode      If should prompt to select environment mode (development,
                  staging, production) to load different env files (e.g.,
                  .env.development, .env.staging, .env.production) when using
                  Vite.
  -h, --help      display help for command

Example usage:
$ turbo-select --run dev --env-mode
```

<!-- [docsgen]: end -->
