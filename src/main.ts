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
  language: "zh" | "en";
  pathMode: "vaultRelative" | "absolute";
  pathStyle: "posix" | "windows"; // only applies to vault-relative paths
  includeRange: boolean; // startLine or start-end
  plainIncludeText: "none" | "firstLine";
  quoteIncludeLocationLink: boolean; // add [[path]] line
  codeBlockLanguage: string; // default: text
  maxTextLen: number; // 0 = unlimited
}

const DEFAULT_SETTINGS: CopyLocationSettings = {
  language: "zh",
  pathMode: "vaultRelative",
  // Nita prefers backslash style like "Primary Mission\\...\\file.md:27".
  pathStyle: "windows",
  includeRange: true,
  plainIncludeText: "firstLine",
  quoteIncludeLocationLink: false,
  codeBlockLanguage: "text",
  maxTextLen: 400
};

type I18nKey =
  | "pluginName"
  | "cmdPlain"
  | "cmdQuote"
  | "cmdCode"
  | "menuPlain"
  | "menuQuote"
  | "menuCode"
  | "noticeNoActiveFile"
  | "noticeCopied"
  | "noticeCopiedFallback"
  | "noticeAbsNotSupported"
  | "settingsTitle"
  | "settingsLanguageName"
  | "settingsLanguageDesc"
  | "settingsLanguageZh"
  | "settingsLanguageEn"
  | "settingsReloadHint"
  | "settingsPathModeName"
  | "settingsPathModeDesc"
  | "settingsPathModeVault"
  | "settingsPathModeAbs"
  | "settingsPathStyleName"
  | "settingsPathStyleDesc"
  | "settingsPathStylePosix"
  | "settingsPathStyleWin"
  | "settingsIncludeRangeName"
  | "settingsIncludeRangeDesc"
  | "settingsPlainIncludeTextName"
  | "settingsPlainIncludeTextDesc"
  | "settingsPlainIncludeTextNo"
  | "settingsPlainIncludeTextYes"
  | "settingsQuoteIncludeLinkName"
  | "settingsQuoteIncludeLinkDesc"
  | "settingsCodeLangName"
  | "settingsCodeLangDesc"
  | "settingsMaxLenName"
  | "settingsMaxLenDesc";

const I18N: Record<CopyLocationSettings["language"], Record<I18nKey, string>> = {
  zh: {
    pluginName: "Copy Location",
    cmdPlain: "复制位置（纯文本）",
    cmdQuote: "复制位置（Markdown 引用）",
    cmdCode: "复制位置（代码块）",
    menuPlain: "复制位置（纯文本）",
    menuQuote: "复制位置（Markdown 引用）",
    menuCode: "复制位置（代码块）",
    noticeNoActiveFile: "Copy Location：当前没有活动文件",
    noticeCopied: "已复制位置",
    noticeCopiedFallback: "已复制位置（fallback）",
    noticeAbsNotSupported: "Copy Location：当前设备不支持绝对路径，已改为复制 vault 相对路径",
    settingsTitle: "Copy Location",
    settingsLanguageName: "语言 / Language",
    settingsLanguageDesc: "插件设置支持中英文。切换语言后，命令名称可能需要 Reload plugins 才会更新显示。",
    settingsLanguageZh: "中文（默认）",
    settingsLanguageEn: "English",
    settingsReloadHint: "提示：切换语言后，建议在 Obsidian 里 Reload plugins（或重启）以刷新命令名称显示。",
    settingsPathModeName: "路径模式",
    settingsPathModeDesc: "复制 vault 相对路径（Obsidian 内部路径）或绝对文件系统路径（仅桌面端）。",
    settingsPathModeVault: "Vault 相对路径（默认）",
    settingsPathModeAbs: "绝对文件系统路径",
    settingsPathStyleName: "路径分隔符风格",
    settingsPathStyleDesc: "仅对 vault 相对路径生效：用 /（posix）或 \\\\（windows）。",
    settingsPathStylePosix: "posix (/)",
    settingsPathStyleWin: "windows (\\\\)",
    settingsIncludeRangeName: "包含行号范围",
    settingsIncludeRangeDesc: "选区跨多行时，复制 start-end；否则只复制起始行号。",
    settingsPlainIncludeTextName: "纯文本：附带文本",
    settingsPlainIncludeTextDesc: "纯文本输出中，是否在位置后面追加选中文本的第一条非空行。",
    settingsPlainIncludeTextNo: "否",
    settingsPlainIncludeTextYes: "是（第一条非空行）",
    settingsQuoteIncludeLinkName: "引用：追加 Obsidian 链接",
    settingsQuoteIncludeLinkDesc: "在位置行后额外加一行 [[path]]。",
    settingsCodeLangName: "代码块语言",
    settingsCodeLangDesc: "代码块 fence 的语言标签，例如：text / md / ts。",
    settingsMaxLenName: "最大文本长度",
    settingsMaxLenDesc: "将复制的文本截断为最多 N 个字符（0 = 不限制）。"
  },
  en: {
    pluginName: "Copy Location",
    cmdPlain: "Copy location (plain)",
    cmdQuote: "Copy location (markdown quote)",
    cmdCode: "Copy location (code block)",
    menuPlain: "Copy location (plain)",
    menuQuote: "Copy location (markdown quote)",
    menuCode: "Copy location (code block)",
    noticeNoActiveFile: "Copy Location: no active file",
    noticeCopied: "Copied location",
    noticeCopiedFallback: "Copied location (fallback)",
    noticeAbsNotSupported: "Copy Location: absolute path not supported on this device; copied vault-relative path instead",
    settingsTitle: "Copy Location",
    settingsLanguageName: "Language / 语言",
    settingsLanguageDesc:
      "Plugin settings support English and Chinese. After switching language, command names may require Reload plugins to refresh.",
    settingsLanguageZh: "Chinese (default)",
    settingsLanguageEn: "English",
    settingsReloadHint: "Tip: after switching language, use Reload plugins (or restart Obsidian) to refresh command names.",
    settingsPathModeName: "Path mode",
    settingsPathModeDesc: "Copy vault-relative path (Obsidian path) or absolute filesystem path (desktop only).",
    settingsPathModeVault: "Vault-relative (default)",
    settingsPathModeAbs: "Absolute filesystem path",
    settingsPathStyleName: "Path style",
    settingsPathStyleDesc: "For vault-relative paths only: use / (posix) or \\\\ (windows).",
    settingsPathStylePosix: "posix (/)",
    settingsPathStyleWin: "windows (\\\\)",
    settingsIncludeRangeName: "Include line range",
    settingsIncludeRangeDesc: "If selection spans multiple lines, copy start-end. Otherwise copy only start line.",
    settingsPlainIncludeTextName: "Plain format: include text",
    settingsPlainIncludeTextDesc: "In plain output, append the first non-empty line of selected text.",
    settingsPlainIncludeTextNo: "No",
    settingsPlainIncludeTextYes: "Yes (first non-empty line)",
    settingsQuoteIncludeLinkName: "Quote format: add Obsidian link",
    settingsQuoteIncludeLinkDesc: "Add an extra line with [[path]] after the location line.",
    settingsCodeLangName: "Code block language",
    settingsCodeLangDesc: 'Fence language tag, e.g. "text", "md", "ts".',
    settingsMaxLenName: "Max text length",
    settingsMaxLenDesc: "Truncate copied text to this many characters (0 = unlimited)."
  }
};

function t(settings: CopyLocationSettings, key: I18nKey): string {
  // Fall back to English if a key is missing.
  return I18N[settings.language]?.[key] ?? I18N.en[key] ?? key;
}

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

    // Use checkCallback instead of editorCallback so commands still work when focus is in
    // the Properties panel (or other non-editor UI) while a markdown note is active.
    this.addCommand({
      id: "copy-location-plain",
      name: t(this.settings, "cmdPlain"),
      checkCallback: (checking) => this.runWithActiveEditor(checking, "plain")
    });

    this.addCommand({
      id: "copy-location-quote",
      name: t(this.settings, "cmdQuote"),
      checkCallback: (checking) => this.runWithActiveEditor(checking, "quote")
    });

    this.addCommand({
      id: "copy-location-code",
      name: t(this.settings, "cmdCode"),
      checkCallback: (checking) => this.runWithActiveEditor(checking, "code")
    });

    this.registerEvent(
      // The Obsidian API includes "editor-menu", but typings may lag behind.
      (this.app.workspace as any).on("editor-menu", (menu: Menu, editor: Editor, _view: MarkdownView) => {
        menu.addSeparator();
        menu.addItem((item) =>
          item
            .setTitle(t(this.settings, "menuPlain"))
            .setIcon("copy")
            .onClick(() => this.copyFromEditor(editor, "plain"))
        );
        menu.addItem((item) =>
          item
            .setTitle(t(this.settings, "menuQuote"))
            .setIcon("quote")
            .onClick(() => this.copyFromEditor(editor, "quote"))
        );
        menu.addItem((item) =>
          item
            .setTitle(t(this.settings, "menuCode"))
            .setIcon("code")
            .onClick(() => this.copyFromEditor(editor, "code"))
        );
      })
    );
  }

  onunload(): void {}

  private runWithActiveEditor(checking: boolean, fmt: OutputFormat): boolean {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    const editor = view?.editor;
    if (!editor) return false;
    if (checking) return true;
    void this.copyFromEditor(editor, fmt);
    return true;
  }

  private async copyFromEditor(editor: Editor, fmt: OutputFormat): Promise<void> {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new Notice(t(this.settings, "noticeNoActiveFile"));
      return;
    }

    const { start, end, text } = computeLineRange(editor);
    const absPath = this.settings.pathMode === "absolute" ? tryGetAbsolutePath(this.app, file.path) : null;
    const displayPath = absPath ?? normalizePath(file.path, this.settings.pathStyle);
    if (this.settings.pathMode === "absolute" && !absPath) {
      new Notice(t(this.settings, "noticeAbsNotSupported"));
    }

    const out = renderOutput(fmt, displayPath, file.path, start, end, text, this.settings);

    try {
      await navigator.clipboard.writeText(out);
      new Notice(t(this.settings, "noticeCopied"));
    } catch {
      // Fallback for restricted clipboard environments.
      // eslint-disable-next-line no-restricted-globals
      (window as any).navigator?.clipboard?.writeText?.(out);
      new Notice(t(this.settings, "noticeCopiedFallback"));
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

    containerEl.createEl("h2", { text: t(this.plugin.settings, "settingsTitle") });

    new Setting(containerEl)
      .setName(t(this.plugin.settings, "settingsLanguageName"))
      .setDesc(t(this.plugin.settings, "settingsLanguageDesc"))
      .addDropdown((dd) => {
        dd.addOption("zh", t(this.plugin.settings, "settingsLanguageZh"));
        dd.addOption("en", t(this.plugin.settings, "settingsLanguageEn"));
        dd.setValue(this.plugin.settings.language);
        dd.onChange(async (v) => {
          this.plugin.settings.language = v as CopyLocationSettings["language"];
          await this.plugin.saveSettings();
          this.display();
          new Notice(t(this.plugin.settings, "settingsReloadHint"));
        });
      });

    new Setting(containerEl)
      .setName(t(this.plugin.settings, "settingsPathModeName"))
      .setDesc(t(this.plugin.settings, "settingsPathModeDesc"))
      .addDropdown((dd) => {
        dd.addOption("vaultRelative", t(this.plugin.settings, "settingsPathModeVault"));
        dd.addOption("absolute", t(this.plugin.settings, "settingsPathModeAbs"));
        dd.setValue(this.plugin.settings.pathMode);
        dd.onChange(async (v) => {
          this.plugin.settings.pathMode = v as CopyLocationSettings["pathMode"];
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t(this.plugin.settings, "settingsPathStyleName"))
      .setDesc(t(this.plugin.settings, "settingsPathStyleDesc"))
      .addDropdown((dd) => {
        dd.addOption("posix", t(this.plugin.settings, "settingsPathStylePosix"));
        dd.addOption("windows", t(this.plugin.settings, "settingsPathStyleWin"));
        dd.setValue(this.plugin.settings.pathStyle);
        dd.onChange(async (v) => {
          this.plugin.settings.pathStyle = v as CopyLocationSettings["pathStyle"];
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t(this.plugin.settings, "settingsIncludeRangeName"))
      .setDesc(t(this.plugin.settings, "settingsIncludeRangeDesc"))
      .addToggle((t) => {
        t.setValue(this.plugin.settings.includeRange);
        t.onChange(async (v) => {
          this.plugin.settings.includeRange = v;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t(this.plugin.settings, "settingsPlainIncludeTextName"))
      .setDesc(t(this.plugin.settings, "settingsPlainIncludeTextDesc"))
      .addDropdown((dd) => {
        dd.addOption("none", t(this.plugin.settings, "settingsPlainIncludeTextNo"));
        dd.addOption("firstLine", t(this.plugin.settings, "settingsPlainIncludeTextYes"));
        dd.setValue(this.plugin.settings.plainIncludeText);
        dd.onChange(async (v) => {
          this.plugin.settings.plainIncludeText = v as CopyLocationSettings["plainIncludeText"];
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t(this.plugin.settings, "settingsQuoteIncludeLinkName"))
      .setDesc(t(this.plugin.settings, "settingsQuoteIncludeLinkDesc"))
      .addToggle((t) => {
        t.setValue(this.plugin.settings.quoteIncludeLocationLink);
        t.onChange(async (v) => {
          this.plugin.settings.quoteIncludeLocationLink = v;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t(this.plugin.settings, "settingsCodeLangName"))
      .setDesc(t(this.plugin.settings, "settingsCodeLangDesc"))
      .addText((txt) => {
        txt.setPlaceholder("text");
        txt.setValue(this.plugin.settings.codeBlockLanguage);
        txt.onChange(async (v) => {
          this.plugin.settings.codeBlockLanguage = v.trim() || "text";
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t(this.plugin.settings, "settingsMaxLenName"))
      .setDesc(t(this.plugin.settings, "settingsMaxLenDesc"))
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
