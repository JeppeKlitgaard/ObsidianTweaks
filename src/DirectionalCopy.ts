import { App, EditableFileView, Editor, MarkdownView } from "obsidian";
import ObsidianTweaksPlugin from "./main";

export enum Direction {
    Up,
    Down,
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

        var anchor = activeView.editor.getCursor("from");
        var head = activeView.editor.getCursor("to");

        var headLength = activeView.editor.getLine(head.line).length;

        var textToCopy = activeView.editor.getRange(
            {line: anchor.line, ch: 0},
            {line: head.line, ch: headLength}
        )

        // Copy up
        if (direction === Direction.Up) {
            activeView.editor.replaceRange(
                textToCopy + '\n',
                {line: anchor.line, ch: 0}
            );
            activeView.editor.setSelection(
                {line: anchor.line, ch: anchor.ch},
                {line: head.line, ch: head.ch},
            );
        }
        // Copy down
        else if (direction === Direction.Down) {
            var addedLines = head.line - anchor.line;
            console.log(addedLines);

            activeView.editor.replaceRange(
                '\n' + textToCopy,
                {line: head.line, ch: headLength}
            );
            activeView.editor.setSelection(
                {line: anchor.line + addedLines + 1, ch: anchor.ch},
                {line: head.line + addedLines + 1, ch: head.ch},
            );
        }
        else {
            console.log("Something went wrong...");
        }

        return;
    }
}