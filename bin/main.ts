import { compileFromConfig } from '../src/compile';
import { readFileSync } from 'fs';
import { CompilerOptions } from 'typescript';

function main() {
  const args = process.argv;

  if (args.length < 4) {
    console.log('Usage: strip-decorators <entrypoint> <path to tsconfigs>\nExample: strip-decorators ./dist/index.js ./tsconfig.json ./tsconfig-prod.json');
    return;
  }

  const entrypoint = args[2]
  const tsconfigs = args.slice(3);

  let options: CompilerOptions = {};
  
  for (const tsconfig of tsconfigs) {
    const buffer = readFileSync(tsconfig);
    const json = JSON.parse(buffer.toString('utf8'));
    options = {...options, ...json.compilerOptions};
  }

  compileFromConfig([entrypoint], options);
}

main();
