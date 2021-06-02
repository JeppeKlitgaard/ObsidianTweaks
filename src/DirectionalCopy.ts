import { App, EditableFileView, Editor, MarkdownView } from "obsidian";
import ObsidianTweaksPlugin from "./main";
import { DEBUG_HEAD } from "./constants";

export enum Direction {
    Up,
    Down,
    Left,
    Right
}

export class DirectionalCopy {
    public app: App;
    private plugin: ObsidianTweaksPlugin;

    constructor(app: App, plugin: ObsidianTweaksPlugin) {
        this.app = app;
        this.plugin = plugin;
    }

    directionalCopy(direction: Direction): void {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) {
            return;
        }

        let anchor = activeView.editor.getCursor("from");
        let head = activeView.editor.getCursor("to");

        let headLength = activeView.editor.getLine(head.line).length;

        let textToCopyVertical = activeView.editor.getRange(
            {line: anchor.line, ch: 0},
            {line: head.line, ch: headLength}
        )

        // Copy up
        if (direction === Direction.Up) {
            activeView.editor.replaceRange(
                textToCopyVertical + '\n',
                {line: anchor.line, ch: 0}
            );
            activeView.editor.setSelection(
                {line: anchor.line, ch: anchor.ch},
                {line: head.line, ch: head.ch},
            );
        }
        // Copy down
        else if (direction === Direction.Down) {
            let addedLines = head.line - anchor.line;

            activeView.editor.replaceRange(
                '\n' + textToCopyVertical,
                {line: head.line, ch: headLength}
            );
            activeView.editor.setSelection(
                {line: anchor.line + addedLines + 1, ch: anchor.ch},
                {line: head.line + addedLines + 1, ch: head.ch},
            );
        }
        // Copy left
        else if (direction === Direction.Left) {
            let textToCopy = activeView.editor.getSelection();

            activeView.editor.replaceRange(
                textToCopy,
                {line: anchor.line, ch: anchor.ch}
            );
            activeView.editor.setSelection(
                {line: anchor.line, ch: anchor.ch},
                {line: head.line, ch: head.ch},
            );
        }
        // Copy right
        else if (direction === Direction.Right) {
            let textToCopy = activeView.editor.getSelection();

            activeView.editor.replaceRange(
                textToCopy,
                {line: anchor.line, ch: anchor.ch}
            );
        }
        else {
            console.log(DEBUG_HEAD + "Something went wrong...");
        }

        return;
    }
}