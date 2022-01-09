import { App, EditorPosition, MarkdownView } from 'obsidian'
import ObsidianTweaksPlugin from './main'

export class BetterFormatting {
  public app: App
  private plugin: ObsidianTweaksPlugin

  constructor(app: App, plugin: ObsidianTweaksPlugin) {
    this.app = app
    this.plugin = plugin
  }

  toggleWrapper(symbolStart: string, symbolEnd: string): void {
    // Principle:
    // Toggling twice == no-op
    // This is not trivial to achieve :(
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
    if (!activeView) {
      return
    }

    const editor = activeView.editor

    const anchor = editor.getCursor('from')
    const head = editor.getCursor('to')

    let wordStart: EditorPosition
    let wordEnd: EditorPosition

    wordStart = editor.cm.findWordAt(anchor).anchor
    wordEnd = editor.cm.findWordAt(head).head

    let textToWrap = editor.getRange(wordStart, wordEnd)

    // Fix for inconsistent toggling
    if (textToWrap.trim() === '') {
      wordStart = anchor
      wordEnd = anchor

      const charBefore = editor.getRange(
        { line: wordStart.line, ch: wordStart.ch - 1 },
        { line: wordStart.line, ch: wordStart.ch },
      )

      // We should've wrapped a whole word more but CM word selection
      // is weird.
      // Let's fix
      if (charBefore.trim() !== '') {
        wordStart = editor.cm.findWordAt({ line: wordStart.line, ch: wordStart.ch - 1 }).anchor
      }

      // Update textToWrap again
      textToWrap = editor.getRange(wordStart, wordEnd)
    }

    let alreadyWrapped = textToWrap.startsWith(symbolStart) && textToWrap.endsWith(symbolEnd)

    // Fix for not all symbols considered part of word
    if (!alreadyWrapped) {
      const preWordStart = editor.getRange(
        { line: wordStart.line, ch: wordStart.ch - symbolStart.length },
        { line: wordStart.line, ch: wordStart.ch },
      )
      const postWordStart = editor.getRange(
        { line: wordEnd.line, ch: wordEnd.ch },
        { line: wordEnd.line, ch: wordEnd.ch + symbolEnd.length },
      )

      if (
        (preWordStart === symbolStart || textToWrap.startsWith(symbolStart)) &&
        (postWordStart === symbolEnd || textToWrap.endsWith(symbolEnd))
      ) {
        // Calculate which offsets to use depending on which of the cases above
        const startOffset = textToWrap.startsWith(symbolStart) ? 0 : -symbolStart.length
        const endOffset = textToWrap.endsWith(symbolEnd) ? 0 : symbolEnd.length

        wordStart = { line: wordStart.line, ch: wordStart.ch + startOffset }
        wordEnd = { line: wordEnd.line, ch: wordEnd.ch + endOffset }

        // Update textToWrap
        textToWrap = editor.getRange(wordStart, wordEnd)
        alreadyWrapped = true
      }
    }

    let newText: string
    if (alreadyWrapped) {
      newText = textToWrap.substring(symbolStart.length, textToWrap.length - symbolEnd.length)
    } else {
      newText = symbolStart + textToWrap + symbolEnd
    }

    editor.replaceRange(
      newText,
      { line: wordStart.line, ch: wordStart.ch },
      { line: wordEnd.line, ch: wordEnd.ch },
    )

    if (alreadyWrapped) {
      editor.setSelection(
        { line: anchor.line, ch: anchor.ch - symbolStart.length },
        { line: head.line, ch: head.ch - symbolStart.length },
      )
    } else {
      editor.setSelection(
        { line: anchor.line, ch: anchor.ch + symbolStart.length },
        { line: head.line, ch: head.ch + symbolStart.length },
      )
    }

    return
  }
}
