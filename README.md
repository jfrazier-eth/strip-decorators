# strip-decorators
Small library and CLI tool to strip decorators and unused imports from a TypeScript project. Using the TypeScript compiler API.

## Installation
### CLI
Install the CLI version globally:

`npm i -g strip-decorators`

Usage: `strip-decorators <entrypoint> <path to tsconfig>`

Example: `strip-decorators ./src/index.ts ./tsconfig.json`

### Library
Install the dependency locally:

`npm i strip-decorators`

Usage:

```js
import { compileFromOptions } = from 'strip-decorators';
import * as tsconfig from './tsconfig.json';

(() => {
  const entrypoints = ['./src/index.ts'];
  compileFromOptions(entrypoints, tsconfig.compilerOptions);
})();
```

See the [example](./example/) for more details.

## Development
```
$ git clone https://github.com/jfrazier-eth/strip-decorators.git && cd strip-decorators
$ npm install
$ npm run build
```

## References
- [`elide-imports.ts`](https://github.com/angular/angular-cli/blob/2539023c304a70d565595e555fad53ac156e0ee8/packages/ngtools/webpack/src/transformers/elide_imports.ts) is copied from the angular CLI
