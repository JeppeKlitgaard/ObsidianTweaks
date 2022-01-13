import { EditorPosition, EditorSelection, EditorRange } from 'obsidian'
import { CursorOffset, CursorOffsets } from 'Entities'

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
