import { App, Editor, EditorChange, EditorTransaction, MarkdownView } from 'obsidian'
import { Direction } from 'tweaks/Entities'
import ObsidianTweaksPlugin from 'tweaks/main'
import { selectionToLine, selectionToRange } from 'tweaks/Utils'

export class DirectionalCopy {
  public app: App
  private plugin: ObsidianTweaksPlugin

  constructor(app: App, plugin: ObsidianTweaksPlugin) {
    this.app = app
    this.plugin = plugin
  }

  directionalCopy(editor: Editor, view: MarkdownView, direction: Direction): void {
    const selections = editor.listSelections()

    const vertical: boolean = direction === Direction.Up || direction === Direction.Down

    // If vertical we want to work with whole lines.
    if (vertical) {
      selections.forEach((selection, idx, arr) => {
        arr[idx] = selectionToLine(editor, selection)
      })
    }

    const changes: Array<EditorChange> = []
    for (const selection of selections) {
      const range = selectionToRange(selection)
      const content = editor.getRange(range.from, range.to)

      let change: EditorChange
      switch (direction) {
        case Direction.Up: {
          change = {
            from: range.from,
            to: range.from,
            text: content + '\n',
          }
          break
        }

        case Direction.Down: {
          change = {
            from: range.to,
            to: range.to,
            text: '\n' + content,
          }
          break
        }

        case Direction.Left: {
          change = {
            from: range.from,
            to: range.from,
            text: content,
          }
          break
        }

        case Direction.Right: {
          change = {
            from: range.to,
            to: range.to,
            text: content,
          }
          break
        }
      }

      changes.push(change)
    }

    const transaction: EditorTransaction = {
      changes: changes,
    }

    const origin = 'DirectionalCopy_' + String(direction)
    editor.transaction(transaction, origin)
  }
}
