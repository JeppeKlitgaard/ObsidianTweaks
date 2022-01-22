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
