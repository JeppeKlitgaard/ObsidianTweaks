import { App, Editor, EditorChange, EditorTransaction, MarkdownView } from 'obsidian'
import { Direction } from 'src/Entities'
import ObsidianTweaksPlugin from 'src/main'
import { selectionToRange } from 'src/Utils'

export class DirectionalMove {
  public app: App
  private plugin: ObsidianTweaksPlugin

  constructor(app: App, plugin: ObsidianTweaksPlugin) {
    this.app = app
    this.plugin = plugin
  }

  directionalMove(
    editor: Editor,
    view: MarkdownView,
    direction: Direction.Left | Direction.Right,
  ): void {
    const selections = editor.listSelections()

    const changes: Array<EditorChange> = []
    for (const selection of selections) {
      const range = selectionToRange(selection)

      let additionChange: EditorChange
      let deletionChange: EditorChange
      switch (direction) {
        case Direction.Left: {
          deletionChange = {
            from: {
              line: range.from.line,
              ch: range.from.ch - 1,
            },
            to: range.from,
            text: '',
          }

          additionChange = {
            from: range.to,
            to: range.to,
            text: editor.getRange(deletionChange.from, deletionChange.to!),
          }
          break
        }

        case Direction.Right: {
          deletionChange = {
            from: range.to,
            to: {
              line: range.to.line,
              ch: range.to.ch + 1,
            },
            text: '',
          }

          additionChange = {
            from: range.from,
            to: range.from,
            text: editor.getRange(deletionChange.from, deletionChange.to!),
          }
          break
        }
      }

      changes.push(deletionChange, additionChange)
    }

    const transaction: EditorTransaction = {
      changes: changes,
    }

    const origin = 'DirectionalMove_' + String(direction)
    editor.transaction(transaction, origin)
  }
}
