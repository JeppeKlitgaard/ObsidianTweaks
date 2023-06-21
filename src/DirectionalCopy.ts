import { App, Editor, EditorChange, EditorRange,EditorTransaction } from 'obsidian'
import { Direction } from 'src/Entities'
import ObsidianTweaksPlugin from 'src/main'
import { selectionToLine, selectionToRange } from 'src/Utils'

export class DirectionalCopy {
  public app: App
  private plugin: ObsidianTweaksPlugin

  constructor(app: App, plugin: ObsidianTweaksPlugin) {
    this.app = app
    this.plugin = plugin
  }

	directionalCopy = (editor: Editor, direction: Direction): void => {
		const selections = editor.listSelections();
		let addedLines = 0;
		const changes: EditorChange[] = [];
		const newSelectionRanges: EditorRange[] = [];

		for (let selection of selections) {
			const newSelection = selectionToLine(
				editor,
				selection,
				direction
			);
			const rangeLine = selectionToRange(newSelection); //already sorted
			const numberOfLines = rangeLine.to.line - rangeLine.from.line + 1;
			const content = editor.getRange(rangeLine.from, rangeLine.to);
			if (!content.trim()) continue;

			let change: EditorChange;
			let newAnchor = {
				line: 0,
				ch: 0,
			};
			let newHead = {
				line: 0,
				ch: 0,
			};

			switch (direction) {
				case Direction.Down:
					addedLines += numberOfLines;
					newAnchor = {
						line: selection.anchor.line + addedLines,
						ch: selection.anchor.ch,
					};
					newHead = {
						line: selection.head.line + addedLines,
						ch: selection.head.ch,
					};

					{
						change = {
							from: rangeLine.to,
							to: rangeLine.to,
							text: "\n" + content,
						};
					}
					break;

				case Direction.Up:
					newAnchor = {
						line: selection.anchor.line + addedLines,
						ch: selection.anchor.ch,
					};
					newHead = {
						line: selection.head.line + addedLines,
						ch: selection.head.ch,
					};

					addedLines += numberOfLines;
					{
						change = {
							from: rangeLine.from,
							to: rangeLine.from,
							text: content + "\n",
						};
					}
					break;

				case Direction.Left: {
					newAnchor = {
						line: selection.anchor.line,
						ch: selection.anchor.ch,
					};
					newHead = {
						line: selection.head.line,
						ch: selection.head.ch,
					};
					change = {
						from: rangeLine.from,
						to: rangeLine.from,
						text: content,
					};
					break;
				}

				case Direction.Right: {
					newAnchor = {
						line: selection.anchor.line,
						ch: selection.anchor.ch+content.length,
					};
					newHead = {
						line: selection.head.line,
						ch: selection.head.ch + content.length,
					};
					change = {
						from: rangeLine.to,
						to: rangeLine.to,
						text: content,
					};
					break;
				}
			}

			newSelectionRanges.push(
				selectionToRange({
					anchor: newAnchor,
					head: newHead,
				})
			);

			changes.push(change);
		}

		if (changes.length > 0) {
			const transaction: EditorTransaction = {
				changes: changes,
				selections: newSelectionRanges,
			};

			const origin = "DirectionalCopy_" + String(direction);
			editor.transaction(transaction, origin);
		}
	};
}
