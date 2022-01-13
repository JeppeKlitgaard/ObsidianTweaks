import { EditorPosition, EditorSelection, EditorRange, Editor } from 'obsidian'
import { CursorOffset, CursorOffsets } from 'Entities'
import _ from 'lodash'

export function getMainSelection(editor: Editor): EditorSelection {
  return {
    anchor: editor.getCursor('anchor'),
    head: editor.getCursor('head'),
  }
}

export function getMainIdx(
  mainSelection: EditorSelection,
  selections: Array<EditorSelection>,
): number {
  return _(selections).findIndex(mainSelection)
}

export function selectionToRange(selection: EditorSelection): EditorRange {
  return {
    from: selection.anchor,
    to: selection.head,
  }
}

function positionIsAfter(position: EditorPosition, offset: CursorOffset): boolean {
  return position.line == offset.line && position.ch >= offset.ch
}

export function applyOffsets(selections: Array<EditorSelection>, offsets: CursorOffsets): void {
  for (const offset of offsets) {
    selections.forEach((sel) => {
      if (positionIsAfter(sel.anchor, offset)) {
        sel.anchor = {
          line: sel.anchor.line,
          ch: sel.anchor.ch + offset.amount,
        }
      }

      if (positionIsAfter(sel.head, offset)) {
        sel.head = {
          line: sel.head.line,
          ch: sel.head.ch + offset.amount,
        }
      }
    })
  }
}
