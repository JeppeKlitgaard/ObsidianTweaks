import { App, PluginSettingTab, Setting } from 'obsidian'
import ObsidianTweaksPlugin from 'main'

export interface ObsidianTweaksSettings {
  debug: boolean
}

export const DEFAULT_SETTINGS: ObsidianTweaksSettings = {
  debug: false,
}

export class ObsidianTweaksSettingTab extends PluginSettingTab {
  public app: App
  private plugin: ObsidianTweaksPlugin

  constructor(app: App, plugin: ObsidianTweaksPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    let desc: DocumentFragment

    containerEl.empty()

    containerEl.createEl('h2', { text: 'Obsidian Tweaks' })

    new Setting(containerEl)
      .setName('Debug mode')
      .setDesc('Whether to output debug logging to console')
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.debug).onChange((debug) => {
          this.plugin.settings.debug = debug
          this.plugin.saveSettings()

          this.display()
        })
      })
  }
}
