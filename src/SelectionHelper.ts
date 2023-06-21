import { App, Editor, EditorRange, EditorTransaction, MarkdownView } from 'obsidian'
import ObsidianTweaksPlugin from 'src/main'
import { selectionToLine, selectionToRange } from 'src/Utils'

export class SelectionHelper {
  public app: App
  private plugin: ObsidianTweaksPlugin

  constructor(app: App, plugin: ObsidianTweaksPlugin) {
    this.app = app
    this.plugin = plugin
  }

  selectLine(editor: Editor, view: MarkdownView): void {
    const selections = editor.listSelections()

    const newSelectionRanges: Array<EditorRange> = []
    for (const selection of selections) {
      const newSelection = selectionToLine(editor, selection)

      newSelectionRanges.push(selectionToRange(newSelection))
    }

    const transaction: EditorTransaction = {
      selections: newSelectionRanges,
    }

    editor.transaction(transaction, 'SelectionHelper_Line')
  }

  selectWord(editor: Editor, view: MarkdownView): void {
    const selections = editor.listSelections()

    const newSelections: Array<EditorRange> = []
    for (const selection of selections) {
      const range = selectionToRange(selection)

      const wordStart = editor.wordAt(range.from)?.from ?? range.from
      const wordEnd = editor.wordAt(range.to)?.to ?? range.from

      const newSelection: EditorRange = {
        from: { line: wordStart.line, ch: wordStart.ch },
        to: { line: wordEnd.line, ch: wordEnd.ch },
      }

      newSelections.push(newSelection)
    }

    const transaction: EditorTransaction = {
      selections: newSelections,
    }

    editor.transaction(transaction, 'SelectionHelper_Line')
  }
}
