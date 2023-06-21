import _ from 'lodash'
import {
  App,
  Editor,
  EditorChange,
  EditorPosition,
  EditorRange,
  EditorRangeOrCaret,
  EditorSelection,
  EditorTransaction,
  MarkdownView,
} from 'obsidian'
import ObsidianTweaksPlugin from 'src/main'
import { getMainSelection, selectionToRange } from 'src/Utils'

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
    // eslint-disable-next-line no-constant-condition
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
    // eslint-disable-next-line no-constant-condition
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
    selection: EditorSelection,
    symbolStart: string,
    symbolEnd: string,
  ): [Array<EditorChange>, EditorSelection] {
    const changes: Array<EditorChange> = [
      {
        from: textRange.from,
        text: symbolStart,
      },
      {
        from: textRange.to,
        text: symbolEnd,
      },
    ]

    const newSelection: EditorSelection = _.cloneDeep(selection)
    newSelection.anchor.ch += symbolStart.length
    newSelection.head.ch += symbolEnd.length

    return [changes, newSelection]
  }

  private unwrap(
    editor: Editor,
    textRange: EditorRange,
    selection: EditorSelection,
    symbolStart: string,
    symbolEnd: string,
  ): [Array<EditorChange>, EditorSelection] {
    const changes: Array<EditorChange> = [
      {
        from: textRange.from,
        to: {
          line: textRange.from.line,
          ch: textRange.from.ch + symbolStart.length,
        },
        text: '',
      },
      {
        from: {
          line: textRange.to.line,
          ch: textRange.to.ch - symbolEnd.length,
        },
        to: textRange.to,
        text: '',
      },
    ]

    const newSelection: EditorSelection = _.cloneDeep(selection)
    newSelection.anchor.ch -= symbolStart.length
    newSelection.head.ch -= symbolStart.length

    return [changes, newSelection]
  }

  private setSelectionWrapState(
    editor: Editor,
    selection: EditorSelection,
    wrapState: boolean,
    symbolStart: string,
    symbolEnd: string,
  ): [Array<EditorChange>, EditorSelection] {
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
      return [[], selection]
    }

    // Wrap or unwrap
    if (wrapState) {
      return this.wrap(editor, textRange, selection, symbolStart, symbolEnd)
    }

    return this.unwrap(editor, textRange, selection, symbolStart, symbolEnd)
  }

  public toggleWrapper(
    editor: Editor,
    view: MarkdownView,
    symbolStart: string,
    symbolEnd?: string,
  ): void {
    // Principle:
    // Toggling twice == no-op
    // This is not trivial to achieve :(
    if (symbolEnd === undefined) {
      symbolEnd = symbolStart
    }

    const selections = editor.listSelections()
    const mainSelection = getMainSelection(editor)

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
    const newChanges: Array<EditorChange> = []
    const newSelectionRanges: Array<EditorRangeOrCaret> = []
    for (const selection of selections) {
      const [changes, newSelection] = this.setSelectionWrapState(
        editor,
        selection,
        targetWrapState,
        symbolStart,
        symbolEnd,
      )

      newChanges.push(...changes)
      newSelectionRanges.push(selectionToRange(newSelection))
    }

    const transaction: EditorTransaction = {
      changes: newChanges,
      selections: newSelectionRanges,
    }

    let origin = targetWrapState ? '+' : '-'
    origin += 'BetterFormatting_' + symbolStart + symbolEnd

    editor.transaction(transaction, origin)
  }
}
