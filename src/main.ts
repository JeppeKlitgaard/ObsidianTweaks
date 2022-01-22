import { Editor, MarkdownView, Plugin } from 'obsidian'
import { BetterFormatting } from 'tweaks/BetterFormatting'
import { DEBUG_HEAD } from 'tweaks/Constants'
import { DirectionalCopy } from 'tweaks/DirectionalCopy'
import { DirectionalMove } from 'tweaks/DirectionalMove'
import { Direction } from 'tweaks/Entities'
import { SelectionHelper } from 'tweaks/SelectionHelper'
import { DEFAULT_SETTINGS, ObsidianTweaksSettings, ObsidianTweaksSettingTab } from 'tweaks/Settings'
import { Heading, ToggleHeading } from 'tweaks/ToggleHeading'

export default class ObsidianTweaksPlugin extends Plugin {
  public settings: ObsidianTweaksSettings

  private selectionHelper: SelectionHelper
  private betterFormatting: BetterFormatting
  private directionalMove: DirectionalMove
  private directionalCopy: DirectionalCopy
  private toggleHeading: ToggleHeading

  async onload() {
    console.log('Loading Obsidian Tweaks...')
    await this.loadSettings()

    this.selectionHelper = new SelectionHelper(this.app, this)
    this.betterFormatting = new BetterFormatting(this.app, this)
    this.directionalMove = new DirectionalMove(this.app, this)
    this.directionalCopy = new DirectionalCopy(this.app, this)
    this.toggleHeading = new ToggleHeading(this.app, this)

    // SelectionHelper
    this.addCommand({
      id: 'select-line',
      name: 'Select Current Line(s)',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.selectionHelper.selectLine(editor, view)
      },
    })
    this.addCommand({
      id: 'select-word',
      name: 'Select Current Word(s)',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.selectionHelper.selectWord(editor, view)
      },
    })

    // Better formatting
    this.addCommand({
      id: 'better-formatting-bold-underscore',
      name: 'Better Toggle Bold (underscores)',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.betterFormatting.toggleWrapper(editor, view, '__', '__')
      },
    })
    this.addCommand({
      id: 'better-formatting-bold-asterisk',
      name: 'Better Toggle Bold (asterisks)',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.betterFormatting.toggleWrapper(editor, view, '**', '**')
      },
    })

    this.addCommand({
      id: 'better-formatting-italics-underscore',
      name: 'Better Toggle Italics (underscore)',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.betterFormatting.toggleWrapper(editor, view, '_', '_')
      },
    })
    this.addCommand({
      id: 'better-formatting-italics-asterisk',
      name: 'Better Toggle Italics (asterisk)',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.betterFormatting.toggleWrapper(editor, view, '*', '*')
      },
    })

    this.addCommand({
      id: 'better-formatting-code',
      name: 'Better Toggle Code',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.betterFormatting.toggleWrapper(editor, view, '`', '`')
      },
    })

    this.addCommand({
      id: 'better-formatting-comment',
      name: 'Better Toggle Comment',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.betterFormatting.toggleWrapper(editor, view, '%%', '%%')
      },
    })

    this.addCommand({
      id: 'better-formatting-highlight',
      name: 'Better Toggle Highlight',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.betterFormatting.toggleWrapper(editor, view, '==', '==')
      },
    })

    this.addCommand({
      id: 'better-formatting-strikethrough',
      name: 'Better Toggle Strikethrough',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.betterFormatting.toggleWrapper(editor, view, '~~', '~~')
      },
    })

    this.addCommand({
      id: 'better-formatting-math-inline',
      name: 'Better Toggle Math (Inline)',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.betterFormatting.toggleWrapper(editor, view, '$', '$')
      },
    })
    this.addCommand({
      id: 'better-formatting-math-block',
      name: 'Better Toggle Math (Block)',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.betterFormatting.toggleWrapper(editor, view, '$$', '$$')
      },
    })

    // Directional Move
    this.addCommand({
      id: 'move-left',
      name: 'Move Selection Left',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.directionalMove.directionalMove(editor, view, Direction.Left)
      },
    })
    this.addCommand({
      id: 'move-right',
      name: 'Move Selection Right',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.directionalMove.directionalMove(editor, view, Direction.Right)
      },
    })

    // Directional Copy
    this.addCommand({
      id: 'copy-line-up',
      name: 'Copy Current Line(s) Up',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.directionalCopy.directionalCopy(editor, view, Direction.Up)
      },
    })
    this.addCommand({
      id: 'copy-line-down',
      name: 'Copy Current Line(s) Down',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.directionalCopy.directionalCopy(editor, view, Direction.Down)
      },
    })
    this.addCommand({
      id: 'copy-line-left',
      name: 'Copy Current Line(s) Left',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.directionalCopy.directionalCopy(editor, view, Direction.Left)
      },
    })
    this.addCommand({
      id: 'copy-line-right',
      name: 'Copy Current Line(s) Right',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.directionalCopy.directionalCopy(editor, view, Direction.Right)
      },
    })

    // Set heading
    this.addCommand({
      id: 'toggle-heading-1',
      name: 'Toggle Heading - H1',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.toggleHeading.toggleHeading(editor, view, Heading.H1)
      },
    })
    this.addCommand({
      id: 'toggle-heading-2',
      name: 'Toggle Heading - H2',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.toggleHeading.toggleHeading(editor, view, Heading.H2)
      },
    })
    this.addCommand({
      id: 'toggle-heading-3',
      name: 'Toggle Heading - H3',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.toggleHeading.toggleHeading(editor, view, Heading.H3)
      },
    })
    this.addCommand({
      id: 'toggle-heading-4',
      name: 'Toggle Heading - H4',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.toggleHeading.toggleHeading(editor, view, Heading.H4)
      },
    })
    this.addCommand({
      id: 'toggle-heading-5',
      name: 'Toggle Heading - H5',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.toggleHeading.toggleHeading(editor, view, Heading.H5)
      },
    })
    this.addCommand({
      id: 'toggle-heading-6',
      name: 'Toggle Heading - H6',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.toggleHeading.toggleHeading(editor, view, Heading.H6)
      },
    })

    this.addSettingTab(new ObsidianTweaksSettingTab(this.app, this))
  }

  onunload() {
    console.log('Unloading Obsidian Tweaks...')
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  debug(str: string) {
    if (this.settings.debug) {
      console.log(DEBUG_HEAD + str)
    }
  }
}
