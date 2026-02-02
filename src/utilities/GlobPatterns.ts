/**
 * Glob pattern utilities for workspace file scanning
 */

export class GlobPatterns {
  /**
   * Default exclude patterns for build/output folders
   * These folders are commonly generated and should be excluded from asset scanning
   */
  static readonly DEFAULT_EXCLUDES = [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/.nuxt/**",
    "**/.output/**",
    "**/out/**",
    "**/.svelte-kit/**",
    "**/.angular/**",
    "**/android/**",
    "**/ios/**",
    "**/macos/**",
    "**/linux/**",
    "**/windows/**",
    "**/.dart_tool/**",
    "**/.gradle/**",
    "**/target/**",
    "**/bin/**",
    "**/obj/**",
  ];

  /**
   * Format user pattern(s) into valid glob query
   * @param pattern User input (comma-separated patterns)
   * @param defaultGlob Default pattern to use if user input is empty
   * @returns Formatted glob pattern
   */
  static formatGlob(pattern: string | undefined, defaultGlob: string): string {
    if (!pattern || pattern.trim() === "") return defaultGlob;

    const parts = pattern
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p !== "");

    if (parts.length === 0) return defaultGlob;
    if (parts.length === 1) return this.formatSingleGlob(parts[0]);

    return `{${parts.map((p) => this.formatSingleGlob(p)).join(",")}}`;
  }

  /**
   * Format single pattern into glob format
   * @param pattern Single user pattern
   * @returns Formatted glob pattern
   */
  static formatSingleGlob(pattern: string): string {
    if (!pattern || pattern.trim() === "") return "";

    // Extension pattern (e.g., *.js)
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

  /**
   * Build exclude query from default and user patterns
   * @param userExclude User exclude pattern (comma-separated)
   * @returns Formatted exclude query for VSCode findFiles API
   */
  static buildExcludeQuery(userExclude?: string): string {
    const userExcludeArr = userExclude
      ? userExclude
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p !== "")
      : [];

    const formattedUserExcludes = userExcludeArr
      .map((p) => this.formatSingleGlob(p))
      .filter((p) => p !== "");

    const allExcludes = [...this.DEFAULT_EXCLUDES, ...formattedUserExcludes];

    return allExcludes.length > 1
      ? `{${allExcludes.join(",")}}`
      : allExcludes[0];
  }
}
