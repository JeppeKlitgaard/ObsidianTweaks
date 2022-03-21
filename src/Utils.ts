import _ from 'lodash'
import { Editor, EditorRange, EditorSelection } from 'obsidian'

export function getMainSelection(editor: Editor): EditorSelection {
  return {
    anchor: editor.getCursor('anchor'),
    head: editor.getCursor('head'),
  }
}

export function selectionToRange(selection: EditorSelection): EditorRange {
  const sortedPositions = _.sortBy([selection.anchor, selection.head], 'line', 'ch')

  return {
    from: sortedPositions[0],
    to: sortedPositions[1],
  }
}

export function selectionToLine(editor: Editor, selection: EditorSelection): EditorSelection {
  const range = selectionToRange(selection)

  const toLength = editor.getLine(range.to.line).length
  const newSelection: EditorSelection = {
    anchor: { line: range.from.line, ch: 0 },
    head: { line: range.to.line, ch: toLength },
  }

  return newSelection
}
