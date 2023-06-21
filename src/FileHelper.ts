import { App, Editor, MarkdownView, Notice } from 'obsidian'
import ObsidianTweaksPlugin from 'src/main'

export class FileHelper {
  public app: App
  private plugin: ObsidianTweaksPlugin

  constructor(app: App, plugin: ObsidianTweaksPlugin) {
    this.app = app
    this.plugin = plugin
  }

  public async duplicateFile(editor: Editor, view: MarkdownView): Promise<void> {
    const activeFile = this.app.workspace.getActiveFile()

    if (activeFile === null) {
      return
    }

    const selections = editor.listSelections()
    const newFilePath =
      activeFile.parent.path + '/' + activeFile.basename + ' (copy).' + activeFile.extension

    try {
      const newFile = await this.app.vault.copy(activeFile, newFilePath)
      await view.leaf.openFile(newFile)

      editor.setSelections(selections)
    } catch (e) {
      new Notice(String(e))
    }
  }

  public async newAdjacentFile(editor: Editor, view: MarkdownView): Promise<void> {
    const activeFile = this.app.workspace.getActiveFile()

    if (activeFile === null) {
      return
    }

    const newFilePath = activeFile.parent.path + '/' + 'Untitled.md'

    try {
      const newFile = await this.app.vault.create(newFilePath, '')
      await view.leaf.openFile(newFile)
    } catch (e) {
      new Notice(String(e))
    }
  }
}
