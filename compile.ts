import * as ts from "typescript";
import { elideImports } from "./elide-imports";
import * as tsConfigFull from './tsconfig.full.json';
import * as tsConfigStripped from './tsconfig.stripped.json';
import * as tsConfigBase from './tsconfig.json';
import { copyFileSync, mkdirSync} from "fs";
import {join} from "path";

const entrypoint = './src/index.ts';

mkdirSync(tsConfigStripped.compilerOptions.outDir)
mkdirSync(tsConfigFull.compilerOptions.outDir)
copyFileSync('./package.json', join(tsConfigStripped.compilerOptions.outDir, 'package.json'));
copyFileSync('./package.json', join(tsConfigFull.compilerOptions.outDir, 'package.json'));

const programFull = ts.createProgram({
  rootNames: [entrypoint],
  options: { ...tsConfigBase.compilerOptions, ...tsConfigFull.compilerOptions } as any as ts.CompilerOptions,
});

const programStripped = ts.createProgram({
  rootNames: [entrypoint],
  options: { ...tsConfigBase.compilerOptions, ...tsConfigStripped.compilerOptions } as any as ts.CompilerOptions,
});

function main() {
    compile(programFull, false);
    compile(programStripped, true);
}

main();

function compile(program: ts.Program, stripDecorators?: boolean) {
  const transformerFactory: ts.TransformerFactory<ts.SourceFile> = (
    context: ts.TransformationContext
  ) => {
    const removedNodes: ts.Node[] = [];
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<any> => {
      if (ts.isDecorator(node)) {
        const decorator = node as ts.Decorator;
        if (ts.isCallExpression(decorator.expression)) {
          const exp = decorator.expression as ts.CallExpression;
          const decoratorName = exp.expression.getText();
          console.log(`Found decorator: ${decoratorName}`);
        }
        removedNodes.push(node);

        return undefined;
      }

      const nodeWithDecoratorsRemoved = ts.visitEachChild(
        node,
        visitor,
        context
      );

      return nodeWithDecoratorsRemoved;
    };

    return (sourceFile: ts.SourceFile) => {
      let updatedSourceFile = ts.visitEachChild(sourceFile, visitor, context);

      if (removedNodes.length > 0) {
        // Remove any unused imports
        const importRemovals = elideImports(
          updatedSourceFile,
          removedNodes,
          program.getTypeChecker,
          context.getCompilerOptions()
        );
        if (importRemovals.size > 0) {
          updatedSourceFile = ts.visitEachChild(
            updatedSourceFile,
            function visitForRemoval(node): ts.Node | undefined {
              return importRemovals.has(node)
                ? undefined
                : ts.visitEachChild(node, visitForRemoval, context);
            },
            context
          );
        }
      }

      return updatedSourceFile;
    };
  };


  if(stripDecorators) {
      program.emit(undefined, undefined, undefined, undefined, {
        before: [transformerFactory],
      });
  } else {
    program.emit();
  }

}
