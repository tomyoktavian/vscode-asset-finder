import * as vscode from "vscode";
import { getUri } from "./utilities/getUri.js";
import { getNonce } from "./utilities/getNonce.js";
import { GlobPatterns } from "./utilities/GlobPatterns.js";
import { SvgProcessor } from "./utilities/SvgProcessor.js";
import { SVG_TAG_REGEX } from "./utilities/RegexPatterns.js";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;
  private _pendingFolder: string | null = null;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public refresh() {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view.webview);
    }
  }

  public selectFolder(uri: vscode.Uri) {
    const relativePath = this._getRelativePath(uri);
    if (this._view) {
      this._view.webview.postMessage({
        type: "selectFolder",
        value: relativePath,
      });
    } else {
      this._pendingFolder = relativePath;
    }
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    if (this._pendingFolder) {
      const folder = this._pendingFolder;
      this._pendingFolder = null;
      // Small delay to ensure webview listener is attached
      setTimeout(() => {
        webviewView.webview.postMessage({
          type: "selectFolder",
          value: folder,
        });
      }, 500);
    }

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
          vscode.window.showInformationMessage("SVG Code copied to clipboard!");
          break;
        }
        case "copyToJsx": {
          const jsx = SvgProcessor.toJsx(data.value);
          await vscode.env.clipboard.writeText(jsx);
          vscode.window.showInformationMessage("JSX code copied to clipboard!");
          break;
        }
        case "copyToReactComponent": {
          const component = SvgProcessor.toReactComponent(
            data.value,
            data.name || "Icon",
          );
          await vscode.env.clipboard.writeText(component);
          vscode.window.showInformationMessage(
            "React Component copied to clipboard!",
          );
          break;
        }
        case "copyToVueComponent": {
          const component = SvgProcessor.toVueComponent(
            data.value,
            data.name || "Icon",
          );
          await vscode.env.clipboard.writeText(component);
          vscode.window.showInformationMessage(
            "Vue Component copied to clipboard!",
          );
          break;
        }
        case "copyToAndroidVector": {
          const xml = SvgProcessor.toAndroidVector(data.value);
          await vscode.env.clipboard.writeText(xml);
          vscode.window.showInformationMessage(
            "Android Vector XML copied to clipboard!",
          );
          break;
        }
        case "copyToXamlPath": {
          const xaml = SvgProcessor.toXamlPath(data.value);
          await vscode.env.clipboard.writeText(xaml);
          vscode.window.showInformationMessage(
            "XAML Path copied to clipboard!",
          );
          break;
        }
        case "copyToBase64": {
          const b64 = SvgProcessor.toBase64(data.value);
          await vscode.env.clipboard.writeText(b64);
          vscode.window.showInformationMessage("Base64 string copied!");
          break;
        }
        case "copyToDataUri": {
          const uri = SvgProcessor.toDataUri(data.value);
          await vscode.env.clipboard.writeText(uri);
          vscode.window.showInformationMessage("Data URI copied!");
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

    const includeQuery = GlobPatterns.formatGlob(include, defaultInclude);
    const excludeQuery = GlobPatterns.buildExcludeQuery(exclude);

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
          let content: string | undefined;

          if (ext === "svg") {
            try {
              const buffer = await vscode.workspace.fs.readFile(uri);
              content = buffer.toString();
            } catch (e) {
              console.error(`Failed to read SVG content: ${uri.fsPath}`);
            }
          }

          return {
            type: "file" as const,
            uri: this._view?.webview.asWebviewUri(uri).toString(),
            path: uri.fsPath,
            relativePath: relativePath,
            name: uri.path.split("/").pop() || "",
            size: stats.size,
            content,
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
      "**/*.{html,jsx,tsx,vue,svelte,php,dart,blade.php,kt,py,xml,xaml,txt,rb,go,rs,java,swift,cpp,h,cs,m,mm}";

    const includeQuery = GlobPatterns.formatGlob(include, defaultInclude);
    const excludeQuery = GlobPatterns.buildExcludeQuery(exclude);

    const files = await vscode.workspace.findFiles(includeQuery, excludeQuery);
    const results: any[] = [];

    for (const file of files) {
      try {
        const content = (await vscode.workspace.fs.readFile(file)).toString();
        let match;
        const relativePath = this._getRelativePath(file);

        SVG_TAG_REGEX.lastIndex = 0;
        while ((match = SVG_TAG_REGEX.exec(content)) !== null) {
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
            content: SvgProcessor.clean(match[0]),
            path: file.fsPath,
            relativePath: relativePath,
            name: `${file.path.split("/").pop()} (L:${line + 1})`,
            size: Buffer.from(match[0]).length,
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
