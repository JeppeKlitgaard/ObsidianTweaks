import { App, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { SelectLine } from 'SelectLine';
import { DirectionalCopy, Direction } from 'DirectionalCopy';
import { ToggleHeading, Heading } from 'ToggleHeading';

interface ObsidianTweaksSettings {
}

const DEFAULT_SETTINGS: ObsidianTweaksSettings = {
}

export default class ObsidianTweaksPlugin extends Plugin {
	public settings: ObsidianTweaksSettings;

	private selectLine: SelectLine;
	private directionalCopy: DirectionalCopy;
	private toggleHeading: ToggleHeading;

	async onload() {
		await this.loadSettings();

		this.selectLine = new SelectLine(this.app, this);
		this.directionalCopy = new DirectionalCopy(this.app, this);
		this.toggleHeading = new ToggleHeading(this.app, this);

		// Select line
		this.addCommand({
			id: 'select-line',
			name: 'Select Current Line(s)',
			callback: () => {
				this.selectLine.selectLine();
			}
		});

		// Directional Copy
		this.addCommand({
			id: 'copy-line-up',
			name: 'Copy Current Line(s) Up',
			callback: () => {
				this.directionalCopy.directionalCopy(Direction.Up);
			}
		});
		this.addCommand({
			id: 'copy-line-down',
			name: 'Copy Current Line(s) Down',
			callback: () => {
				this.directionalCopy.directionalCopy(Direction.Down);
			}
		});
		this.addCommand({
			id: 'copy-line-left',
			name: 'Copy Current Line(s) Left',
			callback: () => {
				this.directionalCopy.directionalCopy(Direction.Left);
			}
		});
		this.addCommand({
			id: 'copy-line-right',
			name: 'Copy Current Line(s) Right',
			callback: () => {
				this.directionalCopy.directionalCopy(Direction.Right);
			}
		});

		// Set heading
		this.addCommand({
			id: 'toggle-heading-1',
			name: 'Toggle Heading - H1',
			callback: () => {
				this.toggleHeading.toggleHeading(Heading.H1);
			}
		});
		this.addCommand({
			id: 'toggle-heading-2',
			name: 'Toggle Heading - H2',
			callback: () => {
				this.toggleHeading.toggleHeading(Heading.H2);
			}
		});
		this.addCommand({
			id: 'toggle-heading-3',
			name: 'Toggle Heading - H3',
			callback: () => {
				this.toggleHeading.toggleHeading(Heading.H3);
			}
		});
		this.addCommand({
			id: 'toggle-heading-4',
			name: 'Toggle Heading - H4',
			callback: () => {
				this.toggleHeading.toggleHeading(Heading.H4);
			}
		});
		this.addCommand({
			id: 'toggle-heading-5',
			name: 'Toggle Heading - H5',
			callback: () => {
				this.toggleHeading.toggleHeading(Heading.H5);
			}
		});
		this.addCommand({
			id: 'toggle-heading-6',
			name: 'Toggle Heading - H6',
			callback: () => {
				this.toggleHeading.toggleHeading(Heading.H6);
			}
		});

		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: ObsidianTweaksPlugin;

	constructor(app: App, plugin: ObsidianTweaksPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Obsidian Tweaks'});

		containerEl.createEl('p', {text: 'Currently nothing here!'});
	}
}
