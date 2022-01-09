import { App, MarkdownView } from 'obsidian'
import ObsidianTweaksPlugin from './main'
import { Direction } from './Constants'

export class DirectionalMove {
  public app: App
  private plugin: ObsidianTweaksPlugin

  constructor(app: App, plugin: ObsidianTweaksPlugin) {
    this.app = app
    this.plugin = plugin
  }

  directionalMove(direction: Direction): void {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
    if (!activeView) {
      return
    }

    // We need to use cm directly to get control of change origins.
    // In the future Obsidian API will likely include support for this.
    const editor = activeView.editor.cm

    const selection = editor.getSelection()

    const anchor = editor.getCursor('from')
    const head = editor.getCursor('to')

    // Move left
    if (direction === Direction.Left) {
      if (anchor.ch - 1 < 0) {
        this.plugin.debug('Moving across lines is not supported.')
        return
      }

      const nextChar = editor.getRange(
        { line: anchor.line, ch: anchor.ch - 1 },
        { line: anchor.line, ch: anchor.ch },
      )

      editor.replaceRange(
        nextChar,
        { line: head.line, ch: head.ch - 1 },
        { line: head.line, ch: head.ch },
        '+tweakMoveLeft',
      )

      editor.replaceRange(
        selection,
        { line: anchor.line, ch: anchor.ch - 1 },
        { line: head.line, ch: head.ch - 1 },
        '+tweakMoveLeft',
      )

      editor.setSelection(
        { line: anchor.line, ch: anchor.ch - 1 },
        { line: head.line, ch: head.ch - 1 },
        { origin: 'tweakMoveLeft' },
      )
    } else if (direction === Direction.Right) {
      if (head.ch + 1 > editor.getLine(head.line).length) {
        this.plugin.debug('Moving across lines is not supported.')
        return
      }

      const nextChar = editor.getRange(
        { line: head.line, ch: head.ch },
        { line: head.line, ch: head.ch + 1 },
      )

      editor.replaceRange(
        nextChar,
        { line: anchor.line, ch: anchor.ch },
        { line: anchor.line, ch: anchor.ch + 1 },
        '+tweakMoveLeft',
      )

      editor.replaceRange(
        selection,
        { line: anchor.line, ch: anchor.ch + 1 },
        { line: head.line, ch: head.ch + 1 },
        '+tweakMoveLeft',
      )

      editor.setSelection(
        { line: anchor.line, ch: anchor.ch + 1 },
        { line: head.line, ch: head.ch + 1 },
        { origin: 'tweakMoveLeft' },
      )
    } else {
      this.plugin.debug('Something went wrong...')
    }

    return
  }
}
