import { App, Editor, MarkdownView } from 'obsidian'
import ObsidianTweaksPlugin from 'tweaks/main'

export class SelectionHelper {
  public app: App
  private plugin: ObsidianTweaksPlugin

  constructor(app: App, plugin: ObsidianTweaksPlugin) {
    this.app = app
    this.plugin = plugin
  }

  selectLine(editor: Editor, view: MarkdownView): void {
    const anchor = editor.getCursor('from')
    const head = editor.getCursor('to')

    const headLength = editor.getLine(head.line).length

    // Modifying and passing the EditorPosition objects does not work
    // reliably.
    // Use this approach instead.
    editor.setSelection({ line: anchor.line, ch: 0 }, { line: head.line, ch: headLength })

    return
  }

  selectWord(editor: Editor, view: MarkdownView): void {
    const anchor = editor.getCursor('from')
    let head = editor.getCursor('to')

    // If next char is a space, we want to grab a whole new word.
    const nextChar = editor.getRange(head, { line: head.line, ch: head.ch + 1 })

    if (nextChar === ' ') {
      head = { line: head.line, ch: head.ch + 1 }
    }

    const wordStart = editor.wordAt(anchor).from
    const wordEnd = editor.wordAt(head).to

    editor.setSelection(
      { line: wordStart.line, ch: wordStart.ch },
      { line: wordEnd.line, ch: wordEnd.ch },
    )

    return
  }
}
