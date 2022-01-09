import { App, Plugin, PluginSettingTab, Setting } from 'obsidian'
import { SelectionHelper } from 'SelectionHelper'
import { BetterFormatting } from 'BetterFormatting'
import { DirectionalMove } from 'DirectionalMove'
import { DirectionalCopy } from 'DirectionalCopy'
import { ToggleHeading, Heading } from 'ToggleHeading'
import { DEBUG_HEAD, Direction } from 'Constants'
import { DEFAULT_SETTINGS, ObsidianTweaksSettings, ObsidianTweaksSettingTab} from 'Settings'

export default class ObsidianTweaksPlugin extends Plugin {
	public settings: ObsidianTweaksSettings

	private selectionHelper: SelectionHelper
	private betterFormatting: BetterFormatting
	private directionalMove: DirectionalMove
	private directionalCopy: DirectionalCopy
	private toggleHeading: ToggleHeading

	async onload() {
		console.log("Loading Obsidian Tweaks...")
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
			callback: () => {
				this.selectionHelper.selectLine()
			}
		})
		this.addCommand({
			id: 'select-word',
			name: 'Select Current Word(s)',
			callback: () => {
				this.selectionHelper.selectWord()
			}
		})

		// Better formatting
		this.addCommand({
			id: 'better-formatting-bold-underscore',
			name: 'Better Toggle Bold (underscores)',
			callback: () => {
				this.betterFormatting.toggleWrapper("__", "__")
			}
		})
		this.addCommand({
			id: 'better-formatting-bold-asterisk',
			name: 'Better Toggle Bold (asterisks)',
			callback: () => {
				this.betterFormatting.toggleWrapper("**", "**")
			}
		})

		this.addCommand({
			id: 'better-formatting-italics-underscore',
			name: 'Better Toggle Italics (underscore)',
			callback: () => {
				this.betterFormatting.toggleWrapper("_", "_")
			}
		})
		this.addCommand({
			id: 'better-formatting-italics-asterisk',
			name: 'Better Toggle Italics (asterisk)',
			callback: () => {
				this.betterFormatting.toggleWrapper("*", "*")
			}
		})

		this.addCommand({
			id: 'better-formatting-code',
			name: 'Better Toggle Code',
			callback: () => {
				this.betterFormatting.toggleWrapper("`", "`")
			}
		})

		this.addCommand({
			id: 'better-formatting-comment',
			name: 'Better Toggle Comment',
			callback: () => {
				this.betterFormatting.toggleWrapper("%%", "%%")
			}
		})

		this.addCommand({
			id: 'better-formatting-highlight',
			name: 'Better Toggle Highlight',
			callback: () => {
				this.betterFormatting.toggleWrapper("==", "==")
			}
		})

		this.addCommand({
			id: 'better-formatting-strikethrough',
			name: 'Better Toggle Strikethrough',
			callback: () => {
				this.betterFormatting.toggleWrapper("~~", "~~")
			}
		})

		this.addCommand({
			id: 'better-formatting-math-inline',
			name: 'Better Toggle Math (Inline)',
			callback: () => {
				this.betterFormatting.toggleWrapper("$", "$")
			}
		})
		this.addCommand({
			id: 'better-formatting-math-block',
			name: 'Better Toggle Math (Block)',
			callback: () => {
				this.betterFormatting.toggleWrapper("$$", "$$")
			}
		})

		// Directional Move
		this.addCommand({
			id: 'move-left',
			name: 'Move Selection Left',
			callback: () => {
				this.directionalMove.directionalMove(Direction.Left)
			}
		})
		this.addCommand({
			id: 'move-right',
			name: 'Move Selection Right',
			callback: () => {
				this.directionalMove.directionalMove(Direction.Right)
			}
		})

		// Directional Copy
		this.addCommand({
			id: 'copy-line-up',
			name: 'Copy Current Line(s) Up',
			callback: () => {
				this.directionalCopy.directionalCopy(Direction.Up)
			}
		})
		this.addCommand({
			id: 'copy-line-down',
			name: 'Copy Current Line(s) Down',
			callback: () => {
				this.directionalCopy.directionalCopy(Direction.Down)
			}
		})
		this.addCommand({
			id: 'copy-line-left',
			name: 'Copy Current Line(s) Left',
			callback: () => {
				this.directionalCopy.directionalCopy(Direction.Left)
			}
		})
		this.addCommand({
			id: 'copy-line-right',
			name: 'Copy Current Line(s) Right',
			callback: () => {
				this.directionalCopy.directionalCopy(Direction.Right)
			}
		})

		// Set heading
		this.addCommand({
			id: 'toggle-heading-1',
			name: 'Toggle Heading - H1',
			callback: () => {
				this.toggleHeading.toggleHeading(Heading.H1)
			}
		})
		this.addCommand({
			id: 'toggle-heading-2',
			name: 'Toggle Heading - H2',
			callback: () => {
				this.toggleHeading.toggleHeading(Heading.H2)
			}
		})
		this.addCommand({
			id: 'toggle-heading-3',
			name: 'Toggle Heading - H3',
			callback: () => {
				this.toggleHeading.toggleHeading(Heading.H3)
			}
		})
		this.addCommand({
			id: 'toggle-heading-4',
			name: 'Toggle Heading - H4',
			callback: () => {
				this.toggleHeading.toggleHeading(Heading.H4)
			}
		})
		this.addCommand({
			id: 'toggle-heading-5',
			name: 'Toggle Heading - H5',
			callback: () => {
				this.toggleHeading.toggleHeading(Heading.H5)
			}
		})
		this.addCommand({
			id: 'toggle-heading-6',
			name: 'Toggle Heading - H6',
			callback: () => {
				this.toggleHeading.toggleHeading(Heading.H6)
			}
		})

		this.addSettingTab(new ObsidianTweaksSettingTab(this.app, this))
	}

	onunload() {
		console.log("Unloading Obsidian Tweaks...")
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

