import { compileFromTsconfig } from '../compile';

function main() {
  const args = process.argv;

  if (args.length < 4) {
    console.log('Usage: strip-decorators <entrypoint> <path to tsconfig>\nExample: strip-decorators ./dist/index.js ./tsconfig.json');
    return;
  }

  const entrypoint = args[2]
  const tsconfig = args[3];

  compileFromTsconfig([entrypoint], tsconfig);
}

main();
