import { dirname, join } from 'path';
import * as ts from "typescript";
import { elideImports } from "./elide-imports";
import { readFileSync } from 'fs';

/**
 * Compiles a TypeScript program, stripping all decorators and unused imports.
 */
export function compile(program: ts.Program) {
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

  program.emit(undefined, undefined, undefined, undefined, {
    before: [transformerFactory],
  });
}

/**
 * Compiles a TypeScript program, stripping all decorators and unused imports.
 */
export function compileFromOptions(rootNames: string[], options: ts.CompilerOptions) {
  const program = ts.createProgram({
    rootNames,
    options,
  });
  
  return compile(program);
}

/**
 * Compiles a TypeScript program, stripping all decorators and unused imports.
 */
 export function compileFromTsconfig(rootNames: string[], tsconfig: string) {
  const childJson = readJSON(tsconfig);
  let parentJson;

  if ('extends' in childJson) {
    parentJson = readJSON(join(dirname(tsconfig), childJson.extends));
  }

  // console.log({parent: parentJson?.compilerOptions, child: childJson.compilerOptions});

  return compileFromOptions(rootNames, {...parentJson?.compilerOptions, ...childJson.compilerOptions});
}


/**
 * Reads JSON from a file.
 */
 function readJSON(filePath: string) {
  const buffer = readFileSync(filePath);
  const json = JSON.parse(buffer.toString('utf8'));
  return json;
}
