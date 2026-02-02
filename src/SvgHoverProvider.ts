import * as vscode from "vscode";
import { PathResolver } from "./utilities/PathResolver.js";
import { SvgProcessor } from "./utilities/SvgProcessor.js";
import { FileUtils } from "./utilities/FileUtils.js";
import { ThemeUtils } from "./utilities/ThemeUtils.js";
import { IMAGE_PATH_REGEX, SVG_TAG_REGEX } from "./utilities/RegexPatterns.js";
import * as fs from "fs";

export class SvgHoverProvider implements vscode.HoverProvider {
  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
  ): Promise<vscode.Hover | undefined> {
    // Disable hover for .xaml files (XAML Path conversion is complex)
    if (document.fileName.toLowerCase().endsWith(".xaml")) {
      return undefined;
    }

    const text = document.getText();
    const offset = document.offsetAt(position);

    SVG_TAG_REGEX.lastIndex = 0;
    let match;
    while ((match = SVG_TAG_REGEX.exec(text)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;

      if (offset >= start && offset <= end) {
        const rawSvg = match[0];
        const processedSvg = SvgProcessor.process(rawSvg, {
          width: 100,
          height: 100,
          colorReplacement: ThemeUtils.getSvgColor(),
        });
        const base64Svg = Buffer.from(processedSvg).toString("base64");
        const dataUri = `data:image/svg+xml;base64,${base64Svg}`;
        const fileSize = FileUtils.formatBytes(
          Buffer.byteLength(rawSvg, "utf8"),
          2,
          true,
        );

        const markdown = new vscode.MarkdownString();
        markdown.supportHtml = true;
        markdown.isTrusted = true;

        const openGalleryCommand = vscode.Uri.parse(
          `command:asset-finder.focus`,
        );

        markdown.appendMarkdown(`
<table border="0">
  <tr>
    <td valign="top" style="padding-right: 12px;">
      <img src="${dataUri}" width="100" height="100" />
    </td>
    <td valign="top">
      <div style="margin-bottom: 2px;"><b>SVG Preview</b></div>
      <div style="font-size: 11px; margin-bottom: 8px;">
        <b>Size:</b> ${fileSize}
      </div>
      <div style="font-size: 10px; opacity: 0.8;">
        <b>Asset Finder</b>
      </div>
      <br/>
      <div style="font-size: 11px;">
        <a href="${openGalleryCommand}">[ Show Gallery ]</a>
      </div>
    </td>
  </tr>
</table>
`);

        return new vscode.Hover(markdown);
      }
    }

    IMAGE_PATH_REGEX.lastIndex = 0;
    let pathMatch;
    while ((pathMatch = IMAGE_PATH_REGEX.exec(text)) !== null) {
      const start = pathMatch.index;
      const end = pathMatch.index + pathMatch[0].length;

      if (offset >= start && offset <= end) {
        const quotedPath = pathMatch[2];
        const absolutePath = PathResolver.resolvePath(quotedPath, document);

        if (absolutePath) {
          const fileUri = vscode.Uri.file(absolutePath);
          const stats = fs.statSync(absolutePath);
          const fileSize = FileUtils.formatBytes(stats.size, 2, true);

          const markdown = new vscode.MarkdownString();
          markdown.supportHtml = true;
          markdown.isTrusted = true;

          const openCommand = vscode.Uri.parse(
            `command:vscode.open?${encodeURIComponent(JSON.stringify([fileUri]))}`,
          );
          const openGalleryCommand = vscode.Uri.parse(
            `command:asset-finder.focus`,
          );

          markdown.appendMarkdown(`
<table border="0">
  <tr>
    <td valign="top" style="padding-right: 12px;">
      <img src="${fileUri}" width="100" height="100" />
    </td>
    <td valign="top">
      <div style="margin-bottom: 2px;"><b>Image Preview</b></div>
      <div style="font-size: 11px; margin-bottom: 8px;">
        <i>Path:</i> <a href="${openCommand}">${quotedPath}</a><br/>
        <b>Size:</b> ${fileSize}
      </div>
      <div style="font-size: 10px; opacity: 0.8;">
        <b>Asset Finder</b>
      </div>
      <br/>
      <div style="font-size: 11px;">
        <a href="${openGalleryCommand}">[ Show Gallery ]</a>
      </div>
    </td>
  </tr>
</table>
`);

          return new vscode.Hover(markdown);
        }
      }
    }

    return undefined;
  }
}
