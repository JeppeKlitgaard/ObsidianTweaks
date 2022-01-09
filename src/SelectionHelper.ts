import { App, MarkdownView } from "obsidian"
import ObsidianTweaksPlugin from "./main"

export class SelectionHelper {
    public app: App
    private plugin: ObsidianTweaksPlugin

    constructor(app: App, plugin: ObsidianTweaksPlugin) {
        this.app = app
        this.plugin = plugin
    }

    selectLine(): void {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
        if (!activeView) {
            return
        }

        const editor = activeView.editor

        var anchor = editor.getCursor("from")
        var head = editor.getCursor("to")

        var headLength = editor.getLine(head.line).length

        // Modifying and passing the EditorPosition objects does not work
        // reliably.
        // Use this approach instead.
        editor.setSelection(
            {line: anchor.line, ch: 0},
            {line: head.line, ch: headLength}
        )

        return
    }

    selectWord(): void {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
        if (!activeView) {
            return
        }

        const editor = activeView.editor

        let anchor = editor.getCursor("from")
        let head = editor.getCursor("to")

        // If next char is a space, we want to grab a whole new word.
        let nextChar = editor.getRange(
            head,
            {line: head.line, ch: head.ch + 1}
        )

        if (nextChar === " ") {
            head = {line: head.line, ch: head.ch + 1}
        }

        let wordStart = editor.cm.findWordAt(anchor).anchor
        let wordEnd = editor.cm.findWordAt(head).head

        editor.setSelection(
            {line: wordStart.line, ch: wordStart.ch},
            {line: wordEnd.line, ch: wordEnd.ch}
        )

        return
    }
}