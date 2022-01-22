import _ from 'lodash'
import {
  App,
  Editor,
  EditorChange,
  EditorPosition,
  EditorTransaction,
  MarkdownView,
} from 'obsidian'
import ObsidianTweaksPlugin from 'tweaks/main'
import { getMainSelection, selectionToRange } from 'tweaks/Utils'

export enum Heading {
  NORMAL = 0,
  H1 = 1,
  H2,
  H3,
  H4,
  H5,
  H6,
}

export class ToggleHeading {
  public app: App
  private plugin: ObsidianTweaksPlugin

  private static HEADING_REGEX = /^(#*)( *)(.*)/

  constructor(app: App, plugin: ObsidianTweaksPlugin) {
    this.app = app
    this.plugin = plugin
  }

  private setHeading(editor: Editor, heading: Heading, line: number): EditorChange {
    const headingStr = '#'.repeat(heading)
    const text = editor.getLine(line)
    const matches = ToggleHeading.HEADING_REGEX.exec(text)
    console.log(matches)

    const from: EditorPosition = {
      line: line,
      ch: 0,
    }
    const to: EditorPosition = {
      line: line,
      ch: matches[1].length + matches[2].length,
    }

    const replacementStr = heading === Heading.NORMAL ? '' : headingStr + ' '

    return {
      from: from,
      to: to,
      text: replacementStr,
    }
  }

  private getHeadingOfLine(editor: Editor, line: number): Heading {
    const text = editor.getLine(line)
    const matches = ToggleHeading.HEADING_REGEX.exec(text)

    return matches[1].length
  }

  toggleHeading(heading: Heading): void {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
    if (!activeView) {
      return
    }

    const editor = activeView.editor

    const selections = editor.listSelections()
    const mainSelection = getMainSelection(editor)
    const mainRange = selectionToRange(mainSelection)

    const mainHeading = this.getHeadingOfLine(editor, mainRange.from.line)
    const targetHeading = heading === mainHeading ? Heading.NORMAL : heading

    const changes: Array<EditorChange> = []

    const linesToSet: Array<number> = _.uniq(
      _.flatten(
        selections.map((x) => {
          const range = selectionToRange(x)
          return _.range(range.from.line, range.to.line + 1)
        }),
      ),
    )

    for (const line of linesToSet) {
      if (editor.getLine(line) === '') {
        continue
      }
      changes.push(this.setHeading(editor, targetHeading, line))
    }

    const transaction: EditorTransaction = {
      changes: changes,
    }

    editor.transaction(transaction, 'ToggleHeading' + heading.toString())
  }
}
