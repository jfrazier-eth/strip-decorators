import { copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as tsConfigStripped from './tsconfig.stripped.json';
import * as tsConfigFull from './tsconfig.full.json';
import * as tsConfigBase from './tsconfig.json';
import { compileFromOptions } from '../src/compile';

const entrypoint = './src/index.ts';

mkdirSync(tsConfigStripped.compilerOptions.outDir);
mkdirSync(tsConfigFull.compilerOptions.outDir);

copyFileSync('./package.json', join(tsConfigStripped.compilerOptions.outDir, 'package.json'));
copyFileSync('./package.json', join(tsConfigFull.compilerOptions.outDir, 'package.json'));

compileFromOptions([entrypoint], { ...tsConfigBase.compilerOptions as any, ...tsConfigStripped.compilerOptions });
