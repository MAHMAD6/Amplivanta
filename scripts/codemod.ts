import { Project, SyntaxKind } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths("lib/**/*-data.ts");
project.addSourceFilesAtPaths("app/(app)/app/**/*.tsx");

const dataFiles = project.getSourceFiles("lib/**/*-data.ts");
const exportedArraysMap = new Map<string, { file: string, newName: string }>();

for (const file of dataFiles) {
  const variableStatements = file.getVariableStatements();
  for (const statement of variableStatements) {
    if (statement.isExported()) {
      const declaration = statement.getDeclarations()[0];
      const initializer = declaration.getInitializer();
      
      if (initializer && initializer.getKind() === SyntaxKind.ArrayLiteralExpression) {
        const originalName = declaration.getName();
        if (originalName === 'STAGE_TONE') continue;

        const camel = originalName.toLowerCase().replace(/_([a-z])/g, (g: any) => g[1].toUpperCase());
        const newName = `get${camel.charAt(0).toUpperCase() + camel.slice(1)}`;
        exportedArraysMap.set(originalName, { file: file.getBaseName(), newName });

        const arrayText = initializer.getText();
        const typeNode = declaration.getTypeNode();
        const typeText = typeNode ? `: Promise<${typeNode.getText()}>` : "";

        statement.replaceWithText(`export async function ${newName}()${typeText} {
  // TODO: Prisma integration
  await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100)); // fake delay for loading state
  return ${arrayText};
}`);
      }
    }
  }
}

const tsxFiles = project.getSourceFiles("app/(app)/app/**/*.tsx");
for (const file of tsxFiles) {
  const imports = file.getImportDeclarations();
  let fileChanged = false;
  const newVariableDeclarations: string[] = [];

  for (const imp of imports) {
    const moduleSpecifier = imp.getModuleSpecifierValue();
    if (moduleSpecifier.startsWith("@/lib/") && moduleSpecifier.endsWith("-data")) {
      const namedImports = imp.getNamedImports();
      for (const namedImport of namedImports) {
        const name = namedImport.getName();
        if (exportedArraysMap.has(name)) {
          const mapping = exportedArraysMap.get(name)!;
          namedImport.setName(mapping.newName);
          newVariableDeclarations.push(`  const ${name} = await ${mapping.newName}();`);
          fileChanged = true;
        }
      }
    }
  }

  if (fileChanged) {
    const functions = file.getFunctions();
    const defaultExport = functions.find((f: any) => f.isDefaultExport());
    if (defaultExport) {
      if (!defaultExport.isAsync()) {
        defaultExport.setIsAsync(true);
      }
      const body = defaultExport.getBody();
      if (body && body.getKind() === SyntaxKind.Block) {
        const block = body.asKind(SyntaxKind.Block);
        if (block) {
          block.insertStatements(0, newVariableDeclarations.join("\\n"));
        }
      }
    }
  }
}

project.saveSync();
console.log("Transformation complete.");
