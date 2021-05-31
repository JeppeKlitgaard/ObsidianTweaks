import { App, MarkdownView } from "obsidian";
import ObsidianTweaksPlugin from "./main";

export class SelectLine {
    public app: App;
    private plugin: ObsidianTweaksPlugin;

    constructor(app: App, plugin: ObsidianTweaksPlugin) {
        this.app = app;
        this.plugin = plugin;
    }

    selectLine(): void {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) {
            return;
        }

        var anchor = activeView.editor.getCursor("from");
        var head = activeView.editor.getCursor("to");

        var headLength = activeView.editor.getLine(head.line).length;

        // Modifying and passing the EditorPosition objects does not work
        // reliably.
        // Use this approach instead.
        activeView.editor.setSelection(
            {line: anchor.line, ch: 0},
            {line: head.line, ch: headLength}
        )

        return;
    }
}