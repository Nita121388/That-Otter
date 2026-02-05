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
  pathMode: "vaultRelative",
  // Nita prefers backslash style like "Primary Mission\\...\\file.md:27".
  pathStyle: "windows",
  includeRange: true,
  plainIncludeText: "firstLine",
  quoteIncludeLocationLink: false,
  codeBlockLanguage: "text",
  maxTextLen: 400
};
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
      this.app.workspace.on("editor-menu", (menu, editor, _view) => {
        menu.addSeparator();
        menu.addItem(
          (item) => item.setTitle("Copy location (plain)").setIcon("copy").onClick(() => this.copyFromEditor(editor, "plain"))
        );
        menu.addItem(
          (item) => item.setTitle("Copy location (markdown quote)").setIcon("quote").onClick(() => this.copyFromEditor(editor, "quote"))
        );
        menu.addItem(
          (item) => item.setTitle("Copy location (code block)").setIcon("code").onClick(() => this.copyFromEditor(editor, "code"))
        );
      })
    );
  }
  onunload() {
  }
  async copyFromEditor(editor, fmt) {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new import_obsidian.Notice("Copy Location: no active file");
      return;
    }
    const { start, end, text } = computeLineRange(editor);
    const absPath = this.settings.pathMode === "absolute" ? tryGetAbsolutePath(this.app, file.path) : null;
    const displayPath = absPath ?? normalizePath(file.path, this.settings.pathStyle);
    if (this.settings.pathMode === "absolute" && !absPath) {
      new import_obsidian.Notice("Copy Location: absolute path not supported on this device; copied vault-relative path instead");
    }
    const out = renderOutput(fmt, displayPath, file.path, start, end, text, this.settings);
    try {
      await navigator.clipboard.writeText(out);
      new import_obsidian.Notice("Copied location");
    } catch {
      window.navigator?.clipboard?.writeText?.(out);
      new import_obsidian.Notice("Copied location (fallback)");
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
    containerEl.createEl("h2", { text: "Copy Location" });
    new import_obsidian.Setting(containerEl).setName("Path mode").setDesc("Copy vault-relative path (Obsidian path) or absolute filesystem path (desktop only).").addDropdown((dd) => {
      dd.addOption("vaultRelative", "Vault-relative (default)");
      dd.addOption("absolute", "Absolute filesystem path");
      dd.setValue(this.plugin.settings.pathMode);
      dd.onChange(async (v) => {
        this.plugin.settings.pathMode = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Path style").setDesc("Use / (posix) or \\\\ (windows) for vault-relative paths.").addDropdown((dd) => {
      dd.addOption("posix", "posix (/)");
      dd.addOption("windows", "windows (\\\\)");
      dd.setValue(this.plugin.settings.pathStyle);
      dd.onChange(async (v) => {
        this.plugin.settings.pathStyle = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Include line range").setDesc("If selection spans multiple lines, copy start-end. Otherwise copy only start line.").addToggle((t) => {
      t.setValue(this.plugin.settings.includeRange);
      t.onChange(async (v) => {
        this.plugin.settings.includeRange = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Plain format: include text").setDesc("In plain output, append the first non-empty line of selected text.").addDropdown((dd) => {
      dd.addOption("none", "No");
      dd.addOption("firstLine", "Yes (first line)");
      dd.setValue(this.plugin.settings.plainIncludeText);
      dd.onChange(async (v) => {
        this.plugin.settings.plainIncludeText = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Quote format: add Obsidian link").setDesc("Add an extra line with [[path]] after the location line.").addToggle((t) => {
      t.setValue(this.plugin.settings.quoteIncludeLocationLink);
      t.onChange(async (v) => {
        this.plugin.settings.quoteIncludeLocationLink = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Code block language").setDesc('Fence language tag, e.g. "text", "md", "ts".').addText((txt) => {
      txt.setPlaceholder("text");
      txt.setValue(this.plugin.settings.codeBlockLanguage);
      txt.onChange(async (v) => {
        this.plugin.settings.codeBlockLanguage = v.trim() || "text";
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Max text length").setDesc("Truncate copied text to this many characters (0 = unlimited).").addText((txt) => {
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
