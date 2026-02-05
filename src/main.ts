import {
  App,
  Editor,
  MarkdownView,
  Menu,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting
} from "obsidian";

type OutputFormat = "plain" | "quote" | "code";

interface CopyLocationSettings {
  pathMode: "vaultRelative" | "absolute";
  pathStyle: "posix" | "windows"; // only applies to vault-relative paths
  includeRange: boolean; // startLine or start-end
  plainIncludeText: "none" | "firstLine";
  quoteIncludeLocationLink: boolean; // add [[path]] line
  codeBlockLanguage: string; // default: text
  maxTextLen: number; // 0 = unlimited
}

const DEFAULT_SETTINGS: CopyLocationSettings = {
  pathMode: "vaultRelative",
  // Nita prefers backslash style like "Primary Mission\\...\\file.md:27".
  pathStyle: "windows",
  includeRange: true,
  plainIncludeText: "firstLine",
  quoteIncludeLocationLink: false,
  codeBlockLanguage: "text",
  maxTextLen: 400
};

function normalizePath(path: string, style: CopyLocationSettings["pathStyle"]): string {
  if (style === "windows") return path.replace(/\//g, "\\");
  return path;
}

function tryGetAbsolutePath(app: App, vaultRelativePath: string): string | null {
  // On desktop (FileSystemAdapter), adapter.getFullPath(path) returns an absolute filesystem path.
  // On mobile / other adapters this may not exist; fall back to vault-relative.
  const adapter = (app.vault.adapter as any) ?? {};
  const getFullPath = adapter.getFullPath as undefined | ((p: string) => string);
  if (!getFullPath) return null;
  try {
    const full = getFullPath(vaultRelativePath);
    return typeof full === "string" && full.length ? full : null;
  } catch {
    return null;
  }
}

function clampText(text: string, maxLen: number): string {
  if (maxLen <= 0) return text;
  if (text.length <= maxLen) return text;
  return text.slice(0, Math.max(0, maxLen - 1)) + "\u2026";
}

function firstNonEmptyLine(text: string): string {
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length > 0) return trimmed;
  }
  return text.split(/\r?\n/)[0] ?? "";
}

function computeLineRange(editor: Editor): { start: number; end: number; text: string; hasSelection: boolean } {
  const sel = editor.getSelection();
  const hasSelection = sel.length > 0;

  // Obsidian EditorPosition is typically 0-based line.
  const from = hasSelection ? editor.getCursor("from") : editor.getCursor();
  const to = hasSelection ? editor.getCursor("to") : editor.getCursor();

  let start0 = from.line;
  let end0 = to.line;

  // If selection ends at start of a later line, users usually mean “up to previous line”.
  if (hasSelection && to.ch === 0 && to.line > from.line) {
    end0 = Math.max(from.line, to.line - 1);
  }

  const start = start0 + 1;
  const end = end0 + 1;

  const text = hasSelection ? sel : editor.getLine(from.line);
  return { start, end, text, hasSelection };
}

function formatLocation(path: string, start: number, end: number, includeRange: boolean): string {
  if (!includeRange || start === end) return `${path}:${start}`;
  return `${path}:${start}-${end}`;
}

function pickFence(content: string): string {
  // Choose a fence that won't be closed accidentally if the content contains ``` etc.
  const matches = content.match(/`{3,}/g) ?? [];
  const maxRun = matches.reduce((m, s) => Math.max(m, s.length), 3);
  return "`".repeat(maxRun + 1);
}

function renderOutput(
  fmt: OutputFormat,
  path: string,
  pathForLink: string,
  start: number,
  end: number,
  text: string,
  settings: CopyLocationSettings
): string {
  const loc = formatLocation(path, start, end, settings.includeRange);

  if (fmt === "plain") {
    if (settings.plainIncludeText === "none") return loc;
    const line = clampText(firstNonEmptyLine(text), settings.maxTextLen);
    return line.length ? `${loc} ${line}` : loc;
  }

  if (fmt === "quote") {
    const bodyText = clampText(text, settings.maxTextLen);
    const lines = bodyText.split(/\r?\n/).map((l) => `> ${l}`);
    const head = settings.quoteIncludeLocationLink ? `${loc}\n[[${pathForLink}]]` : loc;
    return `${head}\n${lines.join("\n")}`;
  }

  // code
  const bodyText = clampText(text, settings.maxTextLen);
  const fence = pickFence(bodyText);
  const lang = (settings.codeBlockLanguage || "text").trim();
  return `${loc}\n${fence}${lang}\n${bodyText}\n${fence}`;
}

export default class CopyLocationPlugin extends Plugin {
  settings!: CopyLocationSettings;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.addSettingTab(new CopyLocationSettingTab(this.app, this));

    this.addCommand({
      id: "copy-location-plain",
      name: "Copy location (plain)",
      editorCallback: (editor) => this.copyFromEditor(editor, "plain")
    });

    this.addCommand({
      id: "copy-location-quote",
      name: "Copy location (markdown quote)",
      editorCallback: (editor) => this.copyFromEditor(editor, "quote")
    });

    this.addCommand({
      id: "copy-location-code",
      name: "Copy location (code block)",
      editorCallback: (editor) => this.copyFromEditor(editor, "code")
    });

    this.registerEvent(
      // The Obsidian API includes "editor-menu", but typings may lag behind.
      (this.app.workspace as any).on("editor-menu", (menu: Menu, editor: Editor, _view: MarkdownView) => {
        menu.addSeparator();
        menu.addItem((item) =>
          item.setTitle("Copy location (plain)").setIcon("copy").onClick(() => this.copyFromEditor(editor, "plain"))
        );
        menu.addItem((item) =>
          item
            .setTitle("Copy location (markdown quote)")
            .setIcon("quote")
            .onClick(() => this.copyFromEditor(editor, "quote"))
        );
        menu.addItem((item) =>
          item
            .setTitle("Copy location (code block)")
            .setIcon("code")
            .onClick(() => this.copyFromEditor(editor, "code"))
        );
      })
    );
  }

  onunload(): void {}

  private async copyFromEditor(editor: Editor, fmt: OutputFormat): Promise<void> {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new Notice("Copy Location: no active file");
      return;
    }

    const { start, end, text } = computeLineRange(editor);
    const absPath = this.settings.pathMode === "absolute" ? tryGetAbsolutePath(this.app, file.path) : null;
    const displayPath = absPath ?? normalizePath(file.path, this.settings.pathStyle);
    if (this.settings.pathMode === "absolute" && !absPath) {
      new Notice("Copy Location: absolute path not supported on this device; copied vault-relative path instead");
    }

    const out = renderOutput(fmt, displayPath, file.path, start, end, text, this.settings);

    try {
      await navigator.clipboard.writeText(out);
      new Notice("Copied location");
    } catch {
      // Fallback for restricted clipboard environments.
      // eslint-disable-next-line no-restricted-globals
      (window as any).navigator?.clipboard?.writeText?.(out);
      new Notice("Copied location (fallback)");
    }
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}

class CopyLocationSettingTab extends PluginSettingTab {
  plugin: CopyLocationPlugin;

  constructor(app: App, plugin: CopyLocationPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Copy Location" });

    new Setting(containerEl)
      .setName("Path mode")
      .setDesc("Copy vault-relative path (Obsidian path) or absolute filesystem path (desktop only).")
      .addDropdown((dd) => {
        dd.addOption("vaultRelative", "Vault-relative (default)");
        dd.addOption("absolute", "Absolute filesystem path");
        dd.setValue(this.plugin.settings.pathMode);
        dd.onChange(async (v) => {
          this.plugin.settings.pathMode = v as CopyLocationSettings["pathMode"];
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Path style")
      .setDesc("Use / (posix) or \\\\ (windows) for vault-relative paths.")
      .addDropdown((dd) => {
        dd.addOption("posix", "posix (/)");
        dd.addOption("windows", "windows (\\\\)");
        dd.setValue(this.plugin.settings.pathStyle);
        dd.onChange(async (v) => {
          this.plugin.settings.pathStyle = v as CopyLocationSettings["pathStyle"];
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Include line range")
      .setDesc("If selection spans multiple lines, copy start-end. Otherwise copy only start line.")
      .addToggle((t) => {
        t.setValue(this.plugin.settings.includeRange);
        t.onChange(async (v) => {
          this.plugin.settings.includeRange = v;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Plain format: include text")
      .setDesc("In plain output, append the first non-empty line of selected text.")
      .addDropdown((dd) => {
        dd.addOption("none", "No");
        dd.addOption("firstLine", "Yes (first line)");
        dd.setValue(this.plugin.settings.plainIncludeText);
        dd.onChange(async (v) => {
          this.plugin.settings.plainIncludeText = v as CopyLocationSettings["plainIncludeText"];
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Quote format: add Obsidian link")
      .setDesc("Add an extra line with [[path]] after the location line.")
      .addToggle((t) => {
        t.setValue(this.plugin.settings.quoteIncludeLocationLink);
        t.onChange(async (v) => {
          this.plugin.settings.quoteIncludeLocationLink = v;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Code block language")
      .setDesc('Fence language tag, e.g. "text", "md", "ts".')
      .addText((txt) => {
        txt.setPlaceholder("text");
        txt.setValue(this.plugin.settings.codeBlockLanguage);
        txt.onChange(async (v) => {
          this.plugin.settings.codeBlockLanguage = v.trim() || "text";
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Max text length")
      .setDesc("Truncate copied text to this many characters (0 = unlimited).")
      .addText((txt) => {
        txt.inputEl.type = "number";
        txt.setValue(String(this.plugin.settings.maxTextLen));
        txt.onChange(async (v) => {
          const n = Number(v);
          this.plugin.settings.maxTextLen = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : DEFAULT_SETTINGS.maxTextLen;
          await this.plugin.saveSettings();
        });
      });
  }
}
