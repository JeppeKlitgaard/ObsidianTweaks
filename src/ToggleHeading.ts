import { App, EditableFileView, Editor, MarkdownView } from "obsidian";
import ObsidianTweaksPlugin from "./main";

export enum Heading {
    H1 = 1,
    H2,
    H3,
    H4,
    H5,
    H6,
}

export class ToggleHeading {
    public app: App;
    private plugin: ObsidianTweaksPlugin;

    constructor(app: App, plugin: ObsidianTweaksPlugin) {
        this.app = app;
        this.plugin = plugin;
    }

    toggleHeading(heading: Heading): void {
        // Three possibilities:
        // 1: Currently no heading text. Set the heading.
        // 2: Currently this heading text. Remove the heading.
        // 3: Currently some other heading. Remove the heading and set this heading.

        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) {
            return;
        }

        var headingText = "#".repeat(heading);
        var anchor = activeView.editor.getCursor("from");

        var lineText = activeView.editor.getLine(anchor.line);

        var regex: RegExp = /^((#*) )?.*/;
        var matches = regex.exec(lineText);

        if (matches[2] !== undefined) {
            // Some heading
            if (matches[2] === headingText) {
                // Option 2
                activeView.editor.replaceRange(
                    '',
                    {line: anchor.line, ch: 0},
                    {line: anchor.line, ch: matches[2].length + 1}
                )
                return;
            } else {
                // Option 3
                activeView.editor.replaceRange(
                    headingText + " ",
                    {line: anchor.line, ch: 0},
                    {line: anchor.line, ch: matches[2].length + 1}
                )
                return;

            }
        }

        activeView.editor.replaceRange(
            headingText + " ",
            {line: anchor.line, ch: 0},
        )
        return;
    }
}