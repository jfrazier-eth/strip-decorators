import * as ts from "typescript";
import { elideImports } from "./elide-imports";

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
export function compileFromConfig(rootNames: string[], tsconfig: any, baseConfig?: any) {
  const program = ts.createProgram({
    rootNames,
    options: { ...baseConfig.compilerOptions, ...tsconfig.compilerOptions, },
  });
  return compile(program);
}
