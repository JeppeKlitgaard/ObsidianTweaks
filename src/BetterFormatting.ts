import { App, Editor, EditorPosition, EditorRange, EditorSelection, MarkdownView } from 'obsidian'
import ObsidianTweaksPlugin from 'main'
import _ from 'lodash'

interface CursorOffset {
  line: number
  ch: number
  amount: number
}

type CursorOffsets = Array<CursorOffset>

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
  ): CursorOffsets {
    const newString = symbolStart + editor.getRange(textRange.from, textRange.to) + symbolEnd
    editor.replaceRange(
      newString,
      textRange.from,
      textRange.to,
      '+BetterFormatting_' + symbolStart + symbolEnd,
    )

    const startOffset = {
      line: textRange.from.line,
      ch: textRange.from.ch,
      amount: symbolStart.length,
    }
    const endOffset = {
      line: textRange.to.line,
      ch: textRange.to.ch + symbolStart.length,
      amount: symbolEnd.length,
    }

    return [startOffset, endOffset]
  }

  private unwrap(
    editor: Editor,
    textRange: EditorRange,
    symbolStart: string,
    symbolEnd: string,
  ): CursorOffsets {
    const oldString = editor.getRange(textRange.from, textRange.to)
    const newString = oldString.substring(symbolStart.length, oldString.length - symbolEnd.length)

    editor.replaceRange(
      newString,
      textRange.from,
      textRange.to,
      '-BetterFormatting_' + symbolStart + symbolEnd,
    )

    const startOffset = {
      line: textRange.from.line,
      ch: textRange.from.ch,
      amount: -symbolStart.length,
    }
    const endOffset = {
      line: textRange.to.line,
      ch: textRange.to.ch,
      amount: -symbolEnd.length,
    }

    return [startOffset, endOffset]
  }

  private toggleSelection(
    editor: Editor,
    selection: EditorSelection,
    symbolStart: string,
    symbolEnd: string,
  ): CursorOffsets {
    const anchor = selection.anchor
    const head = selection.head
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
    let cursorOffsets: CursorOffsets
    if (alreadyWrapped) {
      cursorOffsets = this.unwrap(editor, textRange, symbolStart, symbolEnd)
    } else {
      cursorOffsets = this.wrap(editor, textRange, symbolStart, symbolEnd)
    }

    return cursorOffsets
  }

  private static positionIsAfter(position: EditorPosition, offset: CursorOffset): boolean {
    return position.line == offset.line && position.ch >= offset.ch
  }

  private static applyOffsets(selections: Array<EditorSelection>, offsets: CursorOffsets): void {
    for (const offset of offsets) {
      selections.forEach((sel) => {
        if (BetterFormatting.positionIsAfter(sel.anchor, offset)) {
          sel.anchor = {
            line: sel.anchor.line,
            ch: sel.anchor.ch + offset.amount,
          }
        }

        if (BetterFormatting.positionIsAfter(sel.head, offset)) {
          sel.head = {
            line: sel.head.line,
            ch: sel.head.ch + offset.amount,
          }
        }
      })
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

    const selections = editor.listSelections()
    const mainSelection: EditorSelection = {
      anchor: editor.getCursor('anchor'),
      head: editor.getCursor('head'),
    }

    const mainSelectionIdx = _(selections).findIndex(mainSelection)

    // re-get selection each time to get new ch offsets
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i]

      const cursorOffsets = this.toggleSelection(editor, selection, symbolStart, symbolEnd)
      BetterFormatting.applyOffsets(selections, cursorOffsets)
    }

    editor.setSelections(selections, mainSelectionIdx)
  }
}
