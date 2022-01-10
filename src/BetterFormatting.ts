import { App, Editor, EditorPosition, EditorRange, MarkdownView } from 'obsidian'
import ObsidianTweaksPlugin from 'main'

interface cursorOffsets {
  start: number
  end: number
}

export class BetterFormatting {
  public app: App
  private plugin: ObsidianTweaksPlugin

  static PRE_WIDOW_EXPAND_CHARS = '#$@'
  static POST_WIDOW_EXPAND_CHARS = '!?:'

  constructor(app: App, plugin: ObsidianTweaksPlugin) {
    this.app = app
    this.plugin = plugin
  }

  private expandRangeByWords(
    editor: Editor,
    range: EditorRange,
    symbolStart: string,
    symbolEnd: string,
  ): EditorRange {
    // Expand words
    let from = (editor.wordAt(range.from) || range).from
    let to = (editor.wordAt(range.to) || range).to

    // Do additional expansions intelligently
    // Include leading 'widows'
    while (true) {
      const newFrom: EditorPosition = {
        line: from.line,
        ch: from.ch - 1,
      }

      const newTo: EditorPosition = {
        line: to.line,
        ch: to.ch + 1,
      }

      const preChar = editor.getRange(newFrom, from)
      const postChar = editor.getRange(to, newTo)

      // Don't do this if widows form a matched pair
      if (preChar === postChar) {
        break
      }

      if (symbolStart.endsWith(preChar)) {
        break
      }

      if (!BetterFormatting.PRE_WIDOW_EXPAND_CHARS.includes(preChar)) {
        break
      }

      from = newFrom
    }

    // Include leading 'widows'
    while (true) {
      const newFrom: EditorPosition = {
        line: from.line,
        ch: from.ch - 1,
      }

      const newTo: EditorPosition = {
        line: to.line,
        ch: to.ch + 1,
      }

      const preChar = editor.getRange(newFrom, from)
      const postChar = editor.getRange(to, newTo)

      // Don't do this if widows form a matched pair
      if (preChar === postChar) {
        break
      }

      if (symbolEnd.startsWith(postChar)) {
        break
      }

      if (!BetterFormatting.POST_WIDOW_EXPAND_CHARS.includes(postChar)) {
        break
      }

      to = newTo
    }

    // Include leading symbolStart
    const newFrom = { line: from.line, ch: from.ch - symbolStart.length }
    const preString = editor.getRange(newFrom, from)
    if (preString == symbolStart) {
      from = newFrom
    }

    // Include following symbolEnd
    const newTo = { line: to.line, ch: to.ch + symbolEnd.length }
    const postString = editor.getRange(to, newTo)
    if (postString == symbolStart) {
      to = newTo
    }

    return {
      from: from,
      to: to,
    }
  }

  private isWrapped(
    editor: Editor,
    range: EditorRange,
    symbolStart: string,
    symbolEnd: string,
  ): boolean {
    const text = editor.getRange(range.from, range.to)
    return text.startsWith(symbolStart) && text.endsWith(symbolEnd)
  }

  private wrap(
    editor: Editor,
    textRange: EditorRange,
    symbolStart: string,
    symbolEnd: string,
  ): cursorOffsets {
    const newString = symbolStart + editor.getRange(textRange.from, textRange.to) + symbolEnd
    editor.replaceRange(
      newString,
      textRange.from,
      textRange.to,
      '+BetterFormatting_' + symbolStart + symbolEnd,
    )

    return {
      start: symbolStart.length,
      end: textRange.from.line === textRange.to.line ? symbolStart.length : 0,
    }
  }

  private unwrap(
    editor: Editor,
    textRange: EditorRange,
    symbolStart: string,
    symbolEnd: string,
  ): cursorOffsets {
    const oldString = editor.getRange(textRange.from, textRange.to)
    const newString = oldString.substring(symbolStart.length, oldString.length - symbolEnd.length)

    editor.replaceRange(
      newString,
      textRange.from,
      textRange.to,
      '-BetterFormatting_' + symbolStart + symbolEnd,
    )

    return {
      start: -symbolStart.length,
      end: textRange.from.line === textRange.to.line ? -symbolStart.length : 0,
    }
  }

  toggleWrapper(symbolStart: string, symbolEnd?: string): void {
    // Principle:
    // Toggling twice == no-op
    // This is not trivial to achieve :(
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
    if (!activeView) {
      return
    }

    const editor = activeView.editor

    if (symbolEnd === undefined) {
      symbolEnd = symbolStart
    }

    const anchor = editor.getCursor('from')
    const head = editor.getCursor('to')
    const initialRange: EditorRange = {
      from: anchor,
      to: head,
    }
    const textRange: EditorRange = this.expandRangeByWords(
      editor,
      initialRange,
      symbolStart,
      symbolEnd,
    )

    // Check if already wrapped
    const alreadyWrapped = this.isWrapped(editor, textRange, symbolStart, symbolEnd)

    // Wrap or unwrap
    let cursorOffsets: cursorOffsets
    if (alreadyWrapped) {
      cursorOffsets = this.unwrap(editor, textRange, symbolStart, symbolEnd)
    } else {
      cursorOffsets = this.wrap(editor, textRange, symbolStart, symbolEnd)
    }

    // Set new selection
    editor.setSelection(
      { line: anchor.line, ch: anchor.ch + cursorOffsets.start },
      { line: head.line, ch: head.ch + cursorOffsets.end },
    )
  }
}
