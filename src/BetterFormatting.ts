import { App, Editor, EditorPosition, EditorRange, EditorSelection, MarkdownView } from 'obsidian'
import ObsidianTweaksPlugin from 'main'
import _ from 'lodash'
import { CursorOffsets } from 'Entities'
import { applyOffsets, selectionToRange } from 'Utils'

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

  private setSelectionWrapState(
    editor: Editor,
    selection: EditorSelection,
    wrapState: boolean,
    symbolStart: string,
    symbolEnd: string,
  ): CursorOffsets {
    const initialRange = selectionToRange(selection)
    const textRange: EditorRange = this.expandRangeByWords(
      editor,
      initialRange,
      symbolStart,
      symbolEnd,
    )

    // Check if already wrapped
    const alreadyWrapped = this.isWrapped(editor, textRange, symbolStart, symbolEnd)
    if (alreadyWrapped === wrapState) {
      return []
    }

    // Wrap or unwrap
    let cursorOffsets: CursorOffsets
    if (wrapState) {
      cursorOffsets = this.wrap(editor, textRange, symbolStart, symbolEnd)
    } else {
      cursorOffsets = this.unwrap(editor, textRange, symbolStart, symbolEnd)
    }

    return cursorOffsets
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

    // Get wrapped state of main selection
    const mainRange: EditorRange = this.expandRangeByWords(
      editor,
      selectionToRange(mainSelection),
      symbolStart,
      symbolEnd,
    )

    // Check if already wrapped
    const isWrapped = this.isWrapped(editor, mainRange, symbolStart, symbolEnd)
    const targetWrapState = !isWrapped

    // re-get selection each time to get new ch offsets
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i]

      const cursorOffsets = this.setSelectionWrapState(
        editor,
        selection,
        targetWrapState,
        symbolStart,
        symbolEnd,
      )
      applyOffsets(selections, cursorOffsets)
    }

    editor.setSelections(selections, mainSelectionIdx)
  }
}
