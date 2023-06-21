// import { sortBy } from "lodash"
import _ from "lodash";
import { Editor, EditorRange, EditorSelection } from 'obsidian'
import { Direction } from './Entities'

export function getMainSelection(editor: Editor): EditorSelection {
  return {
    anchor: editor.getCursor('anchor'),
    head: editor.getCursor('head'),
  }
}

export function	selectionToRange(selection: EditorSelection, sort?: boolean): EditorRange {
		const positions = [selection.anchor, selection.head];
		let sortedPositions = positions;
		if (sort) {
			sortedPositions = _.sortBy(positions, ["line", "ch"]);
		}
		return {
			from: sortedPositions[0],
			to: sortedPositions[1],
		};
	}

	export function selectionToLine(
		editor: Editor,
		selection: EditorSelection,
		direction: Direction
	): EditorSelection {
		const range = selectionToRange(selection, true);
		const vertical: boolean =
			direction === Direction.Up || direction === Direction.Down;
		if (vertical) {
			const toLength = editor.getLine(range.to.line).length;
			const newSelection: EditorSelection = {
				anchor: { line: range.from.line, ch: 0 },
				head: { line: range.to.line, ch: toLength },
			};
			return newSelection;
		} else {
			return {
				anchor: editor.getCursor("from"),
				head: editor.getCursor("to"),
			};
		}
	}
