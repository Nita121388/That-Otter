# Copy Location (Obsidian plugin)

Copy selected text with file path + line numbers (AI IDE style).

## What it does

- Copies `path:line` or `path:start-end` (1-based line numbers)
- 3 formats:
  - plain: `path:line[-line]` (optionally + first non-empty line of text)
  - markdown quote: location line + `> ...` quote body
  - code block: location line + fenced code block
- Works from:
  - Command palette commands
  - Editor right-click menu (context menu)

## Install (manual)

This plugin is not published to the Community Plugins directory (yet). Install by copying files into your vault:

1. Find your vault folder.
2. Create: `.obsidian/plugins/copy-location/`
3. Put these files into that folder:
   - `manifest.json`
   - `main.js`
   - `styles.css`
4. In Obsidian: `Settings -> Community plugins`:
   - turn off `Safe mode` (if needed)
   - `Reload plugins` (or restart Obsidian)
   - enable `Copy Location`

## Usage

1. In the editor, select some text (or just place the cursor on a line).
2. Run one of:
   - `Copy location (plain)`
   - `Copy location (markdown quote)`
   - `Copy location (code block)`

Notes:
- If you have no selection, it copies the current line number + the full current line text (for quote/code) or the first non-empty line (for plain).
- If your selection ends at the start of a later line (cursor at column 0), it treats the end line as the previous line (more natural for multi-line selections).

## Examples

Plain:

```text
Primary Mission\\20-ops-network\\file-transfer\\scp.md:12 scp is a file transfer program...
```

Markdown quote:

```text
Primary Mission\\20-ops-network\\file-transfer\\scp.md:12-14
> scp is a file transfer program...
> ...
```

Code block:

````text
Primary Mission\\20-ops-network\\file-transfer\\scp.md:12-14
```text
scp is a file transfer program...
...
```
````

## Settings

- Path mode: `Vault-relative` or `Absolute filesystem path` (desktop only)
- Path style: `posix (/)` or `windows (\\)` (default is `windows`; applies to vault-relative paths)
- Include line range: if selection spans multiple lines, copy `start-end`
- Plain format: include first non-empty line of selected text (or not)
- Quote format: optionally add an extra `[[path]]` line after the location
- Code block language: e.g. `text`, `md`, `ts`
- Max text length: truncate copied text (0 = unlimited)

## Development

```bash
npm i
npm run dev       # watch
npm run build
npm run typecheck
```
