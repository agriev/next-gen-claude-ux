# Shortcuts

Click `? shortcuts` bottom-left in the app to see this list inline.

## Input bar

| Key | Action |
|---|---|
| `/` | focus the input bar |
| `@` | autocomplete card shortNames |
| `Enter` | submit prompt |
| `Shift+Enter` | newline (multi-line input) |
| `Esc` | blur back to canvas |
| click `📎` / drag file / paste image | attach a file to the next prompt — images and PDFs go to Claude as vision blocks; text/markdown/code files get inlined as text |
| drag the top edge of the bar | resize input area; height is persisted |

## Selection

| Key | Action |
|---|---|
| click | select one card |
| shift-click | add/remove from selection |
| `Esc` | clear selection |
| arrows ↑↓←→ | navigate selection in 3D direction |
| `Enter` / `I` | open Inspector for selected |
| `V` | toggle voice-focus mode on selected (refine routes here) |

## Movement

| Key | Action |
|---|---|
| shift-drag card | move (auto-pins) |
| `P` | toggle pin/unpin on selected |

## Edges

| Key | Action |
|---|---|
| `E` (with 2+ selected) | connect with `references` |
| `1` | connect with `derives` |
| `2` | connect with `references` |
| `3` | connect with `contradicts` |
| `4` | connect with `groups-with` |
| click edge label | select edge — opens inline kind picker + delete (`✕`) |
| `Backspace` (with edge selected) | delete edge |
| `Esc` (with edge selected) | deselect edge |
| Inspector → Connections | list all incident edges with delete + kind picker per row; click `@shortName` to jump to the other side |

## Camera

| Key | Action |
|---|---|
| `F` | frame all (or selected if exactly one) |
| `T` | toggle top-down 2D ortho mode |
| RMB-drag | orbit around target |
| WASD | pan along floor plane |
| Q / E | up / down |
| scroll | dolly |
| double-click on card | focus camera on it |
| `1`..`9` | jump to bookmark slot (when nothing is selected) |
| `Shift+1`..`9` | save current view as bookmark |

## Layout & search

| Key | Action |
|---|---|
| `Cmd+L` | layout reorganize menu |
| `Cmd+F` | global fuzzy search |

## Editing

| Key | Action |
|---|---|
| double-click card | open Inspector |
| `Cmd+Enter` (in Inspector edit) | save |
| `Esc` (in Inspector edit) | cancel |
| `Backspace` (with selection) | delete artifact(s) |

## Undo & cancellation

| Key | Action |
|---|---|
| `Cmd+Z` | undo |
| `Cmd+Shift+Z` | redo |
| `Cmd+.` | cancel all running agents |
| `Backspace` (with selection) | delete selected artifact(s) — or selected edge if one is highlighted |

## Voice (best-effort)

| Key | Action |
|---|---|
| hold `Space` (canvas focused) | push-to-talk transcription |
| click `🎙 PTT` | same |
| click `∞ cont` | toggle continuous listening |
