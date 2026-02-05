"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => CopyLocationPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
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
var I18N = {
  zh: {
    pluginName: "Copy Location",
    cmdPlain: "\u590D\u5236\u4F4D\u7F6E\uFF08\u7EAF\u6587\u672C\uFF09",
    cmdQuote: "\u590D\u5236\u4F4D\u7F6E\uFF08Markdown \u5F15\u7528\uFF09",
    cmdCode: "\u590D\u5236\u4F4D\u7F6E\uFF08\u4EE3\u7801\u5757\uFF09",
    menuPlain: "\u590D\u5236\u4F4D\u7F6E\uFF08\u7EAF\u6587\u672C\uFF09",
    menuQuote: "\u590D\u5236\u4F4D\u7F6E\uFF08Markdown \u5F15\u7528\uFF09",
    menuCode: "\u590D\u5236\u4F4D\u7F6E\uFF08\u4EE3\u7801\u5757\uFF09",
    noticeNoActiveFile: "Copy Location\uFF1A\u5F53\u524D\u6CA1\u6709\u6D3B\u52A8\u6587\u4EF6",
    noticeCopied: "\u5DF2\u590D\u5236\u4F4D\u7F6E",
    noticeCopiedFallback: "\u5DF2\u590D\u5236\u4F4D\u7F6E\uFF08fallback\uFF09",
    noticeAbsNotSupported: "Copy Location\uFF1A\u5F53\u524D\u8BBE\u5907\u4E0D\u652F\u6301\u7EDD\u5BF9\u8DEF\u5F84\uFF0C\u5DF2\u6539\u4E3A\u590D\u5236 vault \u76F8\u5BF9\u8DEF\u5F84",
    settingsTitle: "Copy Location",
    settingsLanguageName: "\u8BED\u8A00 / Language",
    settingsLanguageDesc: "\u63D2\u4EF6\u8BBE\u7F6E\u652F\u6301\u4E2D\u82F1\u6587\u3002\u5207\u6362\u8BED\u8A00\u540E\uFF0C\u547D\u4EE4\u540D\u79F0\u53EF\u80FD\u9700\u8981 Reload plugins \u624D\u4F1A\u66F4\u65B0\u663E\u793A\u3002",
    settingsLanguageZh: "\u4E2D\u6587\uFF08\u9ED8\u8BA4\uFF09",
    settingsLanguageEn: "English",
    settingsReloadHint: "\u63D0\u793A\uFF1A\u5207\u6362\u8BED\u8A00\u540E\uFF0C\u5EFA\u8BAE\u5728 Obsidian \u91CC Reload plugins\uFF08\u6216\u91CD\u542F\uFF09\u4EE5\u5237\u65B0\u547D\u4EE4\u540D\u79F0\u663E\u793A\u3002",
    settingsPathModeName: "\u8DEF\u5F84\u6A21\u5F0F",
    settingsPathModeDesc: "\u590D\u5236 vault \u76F8\u5BF9\u8DEF\u5F84\uFF08Obsidian \u5185\u90E8\u8DEF\u5F84\uFF09\u6216\u7EDD\u5BF9\u6587\u4EF6\u7CFB\u7EDF\u8DEF\u5F84\uFF08\u4EC5\u684C\u9762\u7AEF\uFF09\u3002",
    settingsPathModeVault: "Vault \u76F8\u5BF9\u8DEF\u5F84\uFF08\u9ED8\u8BA4\uFF09",
    settingsPathModeAbs: "\u7EDD\u5BF9\u6587\u4EF6\u7CFB\u7EDF\u8DEF\u5F84",
    settingsPathStyleName: "\u8DEF\u5F84\u5206\u9694\u7B26\u98CE\u683C",
    settingsPathStyleDesc: "\u4EC5\u5BF9 vault \u76F8\u5BF9\u8DEF\u5F84\u751F\u6548\uFF1A\u7528 /\uFF08posix\uFF09\u6216 \\\\\uFF08windows\uFF09\u3002",
    settingsPathStylePosix: "posix (/)",
    settingsPathStyleWin: "windows (\\\\)",
    settingsIncludeRangeName: "\u5305\u542B\u884C\u53F7\u8303\u56F4",
    settingsIncludeRangeDesc: "\u9009\u533A\u8DE8\u591A\u884C\u65F6\uFF0C\u590D\u5236 start-end\uFF1B\u5426\u5219\u53EA\u590D\u5236\u8D77\u59CB\u884C\u53F7\u3002",
    settingsPlainIncludeTextName: "\u7EAF\u6587\u672C\uFF1A\u9644\u5E26\u6587\u672C",
    settingsPlainIncludeTextDesc: "\u7EAF\u6587\u672C\u8F93\u51FA\u4E2D\uFF0C\u662F\u5426\u5728\u4F4D\u7F6E\u540E\u9762\u8FFD\u52A0\u9009\u4E2D\u6587\u672C\u7684\u7B2C\u4E00\u6761\u975E\u7A7A\u884C\u3002",
    settingsPlainIncludeTextNo: "\u5426",
    settingsPlainIncludeTextYes: "\u662F\uFF08\u7B2C\u4E00\u6761\u975E\u7A7A\u884C\uFF09",
    settingsQuoteIncludeLinkName: "\u5F15\u7528\uFF1A\u8FFD\u52A0 Obsidian \u94FE\u63A5",
    settingsQuoteIncludeLinkDesc: "\u5728\u4F4D\u7F6E\u884C\u540E\u989D\u5916\u52A0\u4E00\u884C [[path]]\u3002",
    settingsCodeLangName: "\u4EE3\u7801\u5757\u8BED\u8A00",
    settingsCodeLangDesc: "\u4EE3\u7801\u5757 fence \u7684\u8BED\u8A00\u6807\u7B7E\uFF0C\u4F8B\u5982\uFF1Atext / md / ts\u3002",
    settingsMaxLenName: "\u6700\u5927\u6587\u672C\u957F\u5EA6",
    settingsMaxLenDesc: "\u5C06\u590D\u5236\u7684\u6587\u672C\u622A\u65AD\u4E3A\u6700\u591A N \u4E2A\u5B57\u7B26\uFF080 = \u4E0D\u9650\u5236\uFF09\u3002"
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
    settingsLanguageName: "Language / \u8BED\u8A00",
    settingsLanguageDesc: "Plugin settings support English and Chinese. After switching language, command names may require Reload plugins to refresh.",
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
function t(settings, key) {
  return I18N[settings.language]?.[key] ?? I18N.en[key] ?? key;
}
function normalizePath(path, style) {
  if (style === "windows") return path.replace(/\//g, "\\");
  return path;
}
function tryGetAbsolutePath(app, vaultRelativePath) {
  const adapter = app.vault.adapter ?? {};
  const getFullPath = adapter.getFullPath;
  if (!getFullPath) return null;
  try {
    const full = getFullPath(vaultRelativePath);
    return typeof full === "string" && full.length ? full : null;
  } catch {
    return null;
  }
}
function clampText(text, maxLen) {
  if (maxLen <= 0) return text;
  if (text.length <= maxLen) return text;
  return text.slice(0, Math.max(0, maxLen - 1)) + "\u2026";
}
function firstNonEmptyLine(text) {
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length > 0) return trimmed;
  }
  return text.split(/\r?\n/)[0] ?? "";
}
function computeLineRange(editor) {
  const sel = editor.getSelection();
  const hasSelection = sel.length > 0;
  const from = hasSelection ? editor.getCursor("from") : editor.getCursor();
  const to = hasSelection ? editor.getCursor("to") : editor.getCursor();
  let start0 = from.line;
  let end0 = to.line;
  if (hasSelection && to.ch === 0 && to.line > from.line) {
    end0 = Math.max(from.line, to.line - 1);
  }
  const start = start0 + 1;
  const end = end0 + 1;
  const text = hasSelection ? sel : editor.getLine(from.line);
  return { start, end, text, hasSelection };
}
function formatLocation(path, start, end, includeRange) {
  if (!includeRange || start === end) return `${path}:${start}`;
  return `${path}:${start}-${end}`;
}
function pickFence(content) {
  const matches = content.match(/`{3,}/g) ?? [];
  const maxRun = matches.reduce((m, s) => Math.max(m, s.length), 3);
  return "`".repeat(maxRun + 1);
}
function renderOutput(fmt, path, pathForLink, start, end, text, settings) {
  const loc = formatLocation(path, start, end, settings.includeRange);
  if (fmt === "plain") {
    if (settings.plainIncludeText === "none") return loc;
    const line = clampText(firstNonEmptyLine(text), settings.maxTextLen);
    return line.length ? `${loc} ${line}` : loc;
  }
  if (fmt === "quote") {
    const bodyText2 = clampText(text, settings.maxTextLen);
    const lines = bodyText2.split(/\r?\n/).map((l) => `> ${l}`);
    const head = settings.quoteIncludeLocationLink ? `${loc}
[[${pathForLink}]]` : loc;
    return `${head}
${lines.join("\n")}`;
  }
  const bodyText = clampText(text, settings.maxTextLen);
  const fence = pickFence(bodyText);
  const lang = (settings.codeBlockLanguage || "text").trim();
  return `${loc}
${fence}${lang}
${bodyText}
${fence}`;
}
var CopyLocationPlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new CopyLocationSettingTab(this.app, this));
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
      this.app.workspace.on("editor-menu", (menu, editor, _view) => {
        menu.addSeparator();
        menu.addItem(
          (item) => item.setTitle(t(this.settings, "menuPlain")).setIcon("copy").onClick(() => this.copyFromEditor(editor, "plain"))
        );
        menu.addItem(
          (item) => item.setTitle(t(this.settings, "menuQuote")).setIcon("quote").onClick(() => this.copyFromEditor(editor, "quote"))
        );
        menu.addItem(
          (item) => item.setTitle(t(this.settings, "menuCode")).setIcon("code").onClick(() => this.copyFromEditor(editor, "code"))
        );
      })
    );
  }
  onunload() {
  }
  runWithActiveEditor(checking, fmt) {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    const editor = view?.editor;
    if (!editor) return false;
    if (checking) return true;
    void this.copyFromEditor(editor, fmt);
    return true;
  }
  async copyFromEditor(editor, fmt) {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new import_obsidian.Notice(t(this.settings, "noticeNoActiveFile"));
      return;
    }
    const { start, end, text } = computeLineRange(editor);
    const absPath = this.settings.pathMode === "absolute" ? tryGetAbsolutePath(this.app, file.path) : null;
    const displayPath = absPath ?? normalizePath(file.path, this.settings.pathStyle);
    if (this.settings.pathMode === "absolute" && !absPath) {
      new import_obsidian.Notice(t(this.settings, "noticeAbsNotSupported"));
    }
    const out = renderOutput(fmt, displayPath, file.path, start, end, text, this.settings);
    try {
      await navigator.clipboard.writeText(out);
      new import_obsidian.Notice(t(this.settings, "noticeCopied"));
    } catch {
      window.navigator?.clipboard?.writeText?.(out);
      new import_obsidian.Notice(t(this.settings, "noticeCopiedFallback"));
    }
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var CopyLocationSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: t(this.plugin.settings, "settingsTitle") });
    new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settingsLanguageName")).setDesc(t(this.plugin.settings, "settingsLanguageDesc")).addDropdown((dd) => {
      dd.addOption("zh", t(this.plugin.settings, "settingsLanguageZh"));
      dd.addOption("en", t(this.plugin.settings, "settingsLanguageEn"));
      dd.setValue(this.plugin.settings.language);
      dd.onChange(async (v) => {
        this.plugin.settings.language = v;
        await this.plugin.saveSettings();
        this.display();
        new import_obsidian.Notice(t(this.plugin.settings, "settingsReloadHint"));
      });
    });
    new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settingsPathModeName")).setDesc(t(this.plugin.settings, "settingsPathModeDesc")).addDropdown((dd) => {
      dd.addOption("vaultRelative", t(this.plugin.settings, "settingsPathModeVault"));
      dd.addOption("absolute", t(this.plugin.settings, "settingsPathModeAbs"));
      dd.setValue(this.plugin.settings.pathMode);
      dd.onChange(async (v) => {
        this.plugin.settings.pathMode = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settingsPathStyleName")).setDesc(t(this.plugin.settings, "settingsPathStyleDesc")).addDropdown((dd) => {
      dd.addOption("posix", t(this.plugin.settings, "settingsPathStylePosix"));
      dd.addOption("windows", t(this.plugin.settings, "settingsPathStyleWin"));
      dd.setValue(this.plugin.settings.pathStyle);
      dd.onChange(async (v) => {
        this.plugin.settings.pathStyle = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settingsIncludeRangeName")).setDesc(t(this.plugin.settings, "settingsIncludeRangeDesc")).addToggle((t2) => {
      t2.setValue(this.plugin.settings.includeRange);
      t2.onChange(async (v) => {
        this.plugin.settings.includeRange = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settingsPlainIncludeTextName")).setDesc(t(this.plugin.settings, "settingsPlainIncludeTextDesc")).addDropdown((dd) => {
      dd.addOption("none", t(this.plugin.settings, "settingsPlainIncludeTextNo"));
      dd.addOption("firstLine", t(this.plugin.settings, "settingsPlainIncludeTextYes"));
      dd.setValue(this.plugin.settings.plainIncludeText);
      dd.onChange(async (v) => {
        this.plugin.settings.plainIncludeText = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settingsQuoteIncludeLinkName")).setDesc(t(this.plugin.settings, "settingsQuoteIncludeLinkDesc")).addToggle((t2) => {
      t2.setValue(this.plugin.settings.quoteIncludeLocationLink);
      t2.onChange(async (v) => {
        this.plugin.settings.quoteIncludeLocationLink = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settingsCodeLangName")).setDesc(t(this.plugin.settings, "settingsCodeLangDesc")).addText((txt) => {
      txt.setPlaceholder("text");
      txt.setValue(this.plugin.settings.codeBlockLanguage);
      txt.onChange(async (v) => {
        this.plugin.settings.codeBlockLanguage = v.trim() || "text";
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t(this.plugin.settings, "settingsMaxLenName")).setDesc(t(this.plugin.settings, "settingsMaxLenDesc")).addText((txt) => {
      txt.inputEl.type = "number";
      txt.setValue(String(this.plugin.settings.maxTextLen));
      txt.onChange(async (v) => {
        const n = Number(v);
        this.plugin.settings.maxTextLen = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : DEFAULT_SETTINGS.maxTextLen;
        await this.plugin.saveSettings();
      });
    });
  }
};
