import { compile } from './compile';
import { createProgram, ModuleKind, ScriptTarget } from 'typescript';
import { join } from 'path';
import { readFileSync, rmSync } from 'fs';

const entrypoint = join('example', 'src', 'index.ts');
const outDir = join('test', 'result');
const dtoPath = join(outDir, 'dto', 'user.dto.js');

const cleanup = () => rmSync(outDir, {force: true, recursive: true});

beforeEach(cleanup);

test('it should compile and strip decorators', () => {
  const program = createProgram({
    rootNames: [entrypoint],
    options: {
      module: ModuleKind.CommonJS,
      target: ScriptTarget.ES2017, 
      outDir,
    },
  });

  let dto;

  // test compilation with decorations
  program.emit();
  dto = readFileSync(dtoPath);
  expect(dto.toString().includes('__decorate')).toBe(true);
  cleanup();

  // test compilation without decorations
  compile(program);
  dto = readFileSync(dtoPath);
  expect(dto.toString().includes('__decorate')).toBe(false);
  cleanup();
});
