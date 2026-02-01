import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export class PathResolver {
  public static resolvePath(
    importPath: string,
    document: vscode.TextDocument,
  ): string | undefined {
    const docDir = path.dirname(document.uri.fsPath);
    const relativePath = path.resolve(docDir, importPath);
    if (fs.existsSync(relativePath) && fs.lstatSync(relativePath).isFile()) {
      return relativePath;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      for (const folder of workspaceFolders) {
        const workspacePath = path.resolve(
          folder.uri.fsPath,
          importPath.startsWith("/") ? importPath.substring(1) : importPath,
        );
        if (
          fs.existsSync(workspacePath) &&
          fs.lstatSync(workspacePath).isFile()
        ) {
          return workspacePath;
        }

        if (importPath.startsWith("@/") || importPath.startsWith("~/")) {
          const subPath = importPath.substring(2);

          let currentDir = docDir;
          while (currentDir.startsWith(folder.uri.fsPath)) {
            const potentialSrc = path.join(currentDir, "src");
            if (
              fs.existsSync(potentialSrc) &&
              fs.lstatSync(potentialSrc).isDirectory()
            ) {
              const aliasPath = path.resolve(potentialSrc, subPath);
              if (
                fs.existsSync(aliasPath) &&
                fs.lstatSync(aliasPath).isFile()
              ) {
                return aliasPath;
              }
            }
            const parent = path.dirname(currentDir);
            if (parent === currentDir) break;
            currentDir = parent;
          }

          let projectRoot = docDir;
          while (projectRoot.startsWith(folder.uri.fsPath)) {
            const checkPath = path.resolve(projectRoot, subPath);
            if (fs.existsSync(checkPath) && fs.lstatSync(checkPath).isFile()) {
              return checkPath;
            }
            const parent = path.dirname(projectRoot);
            if (parent === projectRoot) break;
            projectRoot = parent;
          }

          const workspaceRootPath = path.resolve(folder.uri.fsPath, subPath);
          if (
            fs.existsSync(workspaceRootPath) &&
            fs.lstatSync(workspaceRootPath).isFile()
          ) {
            return workspaceRootPath;
          }
        }
      }
    }

    return undefined;
  }

  public static isImageFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"].includes(ext);
  }
}
