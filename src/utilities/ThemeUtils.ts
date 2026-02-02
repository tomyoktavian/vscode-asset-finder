import * as vscode from "vscode";

/**
 * Theme utilities for detecting VS Code color theme
 */
export class ThemeUtils {
  /**
   * Get appropriate SVG color based on current VS Code theme
   * @returns '#FFFFFF' for dark themes, '#000000' for light themes
   */
  static getSvgColor(): string {
    const theme = vscode.window.activeColorTheme;

    if (
      theme.kind === vscode.ColorThemeKind.Dark ||
      theme.kind === vscode.ColorThemeKind.HighContrast
    ) {
      return "#FFFFFF";
    } else {
      return "#000000";
    }
  }
}
