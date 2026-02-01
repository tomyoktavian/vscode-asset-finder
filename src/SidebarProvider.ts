import * as vscode from "vscode";
import { getUri } from "./utilities/getUri.js";
import { getNonce } from "./utilities/getNonce.js";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public refresh() {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view.webview);
    }
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri,
        ...(vscode.workspace.workspaceFolders?.map((f) => f.uri) || []),
      ],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        case "scanImages": {
          const { includePattern, excludePattern } = data.value || {};
          const [files, inlineSvgs] = await Promise.all([
            this._scanWorkspaceImages(includePattern, excludePattern),
            this._scanInlineSVGs(includePattern, excludePattern),
          ]);
          webviewView.webview.postMessage({
            type: "imageResults",
            value: [...files, ...inlineSvgs],
          });
          break;
        }
        case "openInEditor": {
          const { path, type, line, character, lineEnd, characterEnd } =
            data.value;
          const uri = vscode.Uri.file(path);

          if (type === "file") {
            await vscode.commands.executeCommand("vscode.open", uri);
          } else {
            const doc = await vscode.workspace.openTextDocument(uri);
            const editor = await vscode.window.showTextDocument(doc);

            if (line !== undefined && character !== undefined) {
              const startPos = new vscode.Position(line, character);
              const endPos =
                lineEnd !== undefined && characterEnd !== undefined
                  ? new vscode.Position(lineEnd, characterEnd)
                  : startPos;

              editor.selection = new vscode.Selection(startPos, endPos);
              editor.revealRange(
                new vscode.Range(startPos, endPos),
                vscode.TextEditorRevealType.InCenter,
              );
            }
          }
          break;
        }
        case "copyPath": {
          const relativePath = vscode.workspace.asRelativePath(data.value);
          await vscode.env.clipboard.writeText(relativePath);
          vscode.window.showInformationMessage(
            `Copied relative path: ${relativePath}`,
          );
          break;
        }
        case "copyCode": {
          await vscode.env.clipboard.writeText(data.value);
          vscode.window.showInformationMessage(
            "SVG Code copied to clipboard!",
            { modal: true, detail: data.value },
          );
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private async _scanWorkspaceImages(include?: string, exclude?: string) {
    const defaultInclude =
      "**/*.{png,jpg,jpeg,gif,svg,webp,mp3,wav,ogg,m4a,mp4,webm,pdf,xlsx,xls,csv,docx,doc,zip}";
    const defaultExclude = "**/node_modules/**";

    const includeQuery = this._formatGlob(include, defaultInclude);

    const userExcludeArr = exclude
      ? exclude
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p !== "")
      : [];
    const formattedUserExcludes = userExcludeArr
      .map((p) => this._formatSingleGlob(p))
      .filter((p) => p !== "");

    let excludeQuery = defaultExclude;
    if (formattedUserExcludes.length > 0) {
      excludeQuery = `{${defaultExclude},${formattedUserExcludes.join(",")}}`;
    }

    const images = await vscode.workspace.findFiles(includeQuery, excludeQuery);

    const results = await Promise.all(
      images.map(async (uri) => {
        const relativePath = this._getRelativePath(uri);
        const ext = uri.path.split(".").pop()?.toLowerCase() || "";

        const assetExtensions = [
          "png",
          "jpg",
          "jpeg",
          "gif",
          "svg",
          "webp",
          "mp3",
          "wav",
          "ogg",
          "m4a",
          "mp4",
          "webm",
          "pdf",
          "xlsx",
          "xls",
          "csv",
          "docx",
          "doc",
          "zip",
        ];

        if (!assetExtensions.includes(ext)) {
          return null;
        }

        try {
          const stats = await vscode.workspace.fs.stat(uri);
          return {
            type: "file" as const,
            uri: this._view?.webview.asWebviewUri(uri).toString(),
            path: uri.fsPath,
            relativePath: relativePath,
            name: uri.path.split("/").pop() || "",
            size: stats.size,
          };
        } catch (e) {
          return {
            type: "file" as const,
            uri: this._view?.webview.asWebviewUri(uri).toString(),
            path: uri.fsPath,
            relativePath: relativePath,
            name: uri.path.split("/").pop() || "",
          };
        }
      }),
    );

    return results.filter((r): r is any => r !== null);
  }

  private async _scanInlineSVGs(include?: string, exclude?: string) {
    const defaultInclude =
      "**/*.{html,jsx,tsx,vue,svelte,php,dart,blade.php,kt,py,xml,txt,rb,go,rs,java,swift,cpp,h,cs,m,mm}";
    const defaultExclude = "**/node_modules/**";

    const includeQuery = this._formatGlob(include, defaultInclude);

    const userExcludeArr = exclude
      ? exclude
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p !== "")
      : [];
    const formattedUserExcludes = userExcludeArr
      .map((p) => this._formatSingleGlob(p))
      .filter((p) => p !== "");

    let excludeQuery = defaultExclude;
    if (formattedUserExcludes.length > 0) {
      excludeQuery = `{${defaultExclude},${formattedUserExcludes.join(",")}}`;
    }

    const files = await vscode.workspace.findFiles(includeQuery, excludeQuery);
    const results: any[] = [];

    const svgRegex = /<svg[\s\S]*?<\/svg>/g;

    for (const file of files) {
      try {
        const content = (await vscode.workspace.fs.readFile(file)).toString();
        let match;
        const relativePath = this._getRelativePath(file);

        while ((match = svgRegex.exec(content)) !== null) {
          const start = match.index;
          const end = match.index + match[0].length;

          const startLines = content.substring(0, start).split("\n");
          const line = startLines.length - 1;
          const character = startLines[startLines.length - 1].length;

          const endLines = content.substring(0, end).split("\n");
          const lineEnd = endLines.length - 1;
          const characterEnd = endLines[endLines.length - 1].length;

          results.push({
            type: "inline",
            content: this._cleanSvg(match[0]),
            path: file.fsPath,
            relativePath: relativePath,
            name: `${file.path.split("/").pop()} (L:${line + 1})`,
            line,
            character,
            lineEnd,
            characterEnd,
          });
        }
      } catch (e) {
        console.error(`Failed to read file ${file.fsPath}:`, e);
      }
    }
    return results;
  }

  private _cleanSvg(svg: string): string {
    return svg
      .replace(/className=/g, "class=")
      .replace(/strokeWidth=/g, "stroke-width=")
      .replace(/strokeLinecap=/g, "stroke-linecap=")
      .replace(/strokeLinejoin=/g, "stroke-linejoin=")
      .replace(/fillRule=/g, "fill-rule=")
      .replace(/clipRule=/g, "clip-rule=")
      .replace(/={([\s\S]*?)}/g, '="$1"')
      .replace(/\s(width|height)=".*?"/g, "")
      .replace(/currentColor/g, "var(--foreground)");
  }

  private _getRelativePath(uri: vscode.Uri): string {
    let relativePath = vscode.workspace.asRelativePath(uri, false);
    if (
      relativePath.startsWith("/") ||
      relativePath.includes(":/") ||
      relativePath === uri.fsPath
    ) {
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
      if (workspaceFolder) {
        const rootPath = workspaceFolder.uri.fsPath;
        if (uri.fsPath.startsWith(rootPath)) {
          relativePath = uri.fsPath.substring(rootPath.length);
          if (relativePath.startsWith("/") || relativePath.startsWith("\\")) {
            relativePath = relativePath.substring(1);
          }
        }
      }
    }
    return relativePath;
  }

  private _formatGlob(
    pattern: string | undefined,
    defaultGlob: string,
  ): string {
    if (!pattern || pattern.trim() === "") return defaultGlob;

    const parts = pattern
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p !== "");
    if (parts.length === 0) return defaultGlob;
    if (parts.length === 1) return this._formatSingleGlob(parts[0]);

    return `{${parts.map((p) => this._formatSingleGlob(p)).join(",")}}`;
  }

  private _formatSingleGlob(pattern: string): string {
    if (!pattern || pattern.trim() === "") return "";

    if (pattern.startsWith("*.")) {
      return `**/${pattern}`;
    }

    if (pattern.includes("**") || pattern.includes("?")) return pattern;

    let clean = pattern.trim().replace(/^\/|\/$/g, "");

    if (clean.includes(".") && !clean.startsWith(".")) {
      return `**/${clean}`;
    }

    return `**/${clean}/**`;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const stylesUri = getUri(webview, this._extensionUri, [
      "webview-ui",
      "dist",
      "index.css",
    ]);
    const scriptUri = getUri(webview, this._extensionUri, [
      "webview-ui",
      "dist",
      "index.js",
    ]);

    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https: data:; media-src ${webview.cspSource} https:; object-src ${webview.cspSource} https:; font-src ${webview.cspSource};">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Asset Finder</title>
        </head>
        <body>
          <div id="root"></div>
          <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>`;
  }
}
