import { App, MarkdownView } from 'obsidian'
import ObsidianTweaksPlugin from 'main'
import { Direction } from 'Entities'

export class DirectionalCopy {
  public app: App
  private plugin: ObsidianTweaksPlugin

  constructor(app: App, plugin: ObsidianTweaksPlugin) {
    this.app = app
    this.plugin = plugin
  }

  directionalCopy(direction: Direction): void {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
    if (!activeView) {
      return
    }

    const editor = activeView.editor

    const anchor = editor.getCursor('from')
    const head = editor.getCursor('to')

    const headLength = editor.getLine(head.line).length

    const textToCopyVertical = editor.getRange(
      { line: anchor.line, ch: 0 },
      { line: head.line, ch: headLength },
    )

    // Copy up
    if (direction === Direction.Up) {
      editor.replaceRange(textToCopyVertical + '\n', { line: anchor.line, ch: 0 })
      editor.setSelection({ line: anchor.line, ch: anchor.ch }, { line: head.line, ch: head.ch })
    }
    // Copy down
    else if (direction === Direction.Down) {
      const addedLines = head.line - anchor.line

      editor.replaceRange('\n' + textToCopyVertical, { line: head.line, ch: headLength })
      editor.setSelection(
        { line: anchor.line + addedLines + 1, ch: anchor.ch },
        { line: head.line + addedLines + 1, ch: head.ch },
      )
    }
    // Copy left
    else if (direction === Direction.Left) {
      const textToCopy = editor.getSelection()

      editor.replaceRange(textToCopy, { line: anchor.line, ch: anchor.ch })
      editor.setSelection({ line: anchor.line, ch: anchor.ch }, { line: head.line, ch: head.ch })
    }
    // Copy right
    else if (direction === Direction.Right) {
      const textToCopy = editor.getSelection()

      editor.replaceRange(textToCopy, { line: anchor.line, ch: anchor.ch })
    } else {
      this.plugin.debug('Something went wrong...')
    }

    return
  }
}
