# EuroStruct 1090

EuroStruct 1090 includes structural beam and safe lifting calculators, EN 1090 documentation, a Eurocode reference library and SolidWorks exports.

## Build the standalone app

Install Bun, then run these commands from the repository:

```sh
bun install --frozen-lockfile
bun run build:standalone
```

Open `dist-standalone/EuroStruct-1090.html` in a current desktop browser. The file contains the full app and can be copied to another computer and opened offline. Use **Export Project** to save the current inputs and results.

## Run the web app

Use `bun run dev` for local development and `bun run build` to generate the deployable web app in `dist/`.
